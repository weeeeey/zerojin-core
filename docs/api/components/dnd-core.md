# DndGrid Core Architecture

이 문서는 `DndGrid`의 내부 동작 원리, 데이터 구조, 그리고 복잡한 Drag & Drop 상황에서도 안정적으로 상태를 유지하기 위한 구현 전략을 다룹니다.

---

## 1. 설계 철학

DndGrid는 **"논리적 구조(Tree)"**와 **"렌더링 구조(Flat)"**를 분리하여 설계되었습니다.
- **논리적 트리(Logical Tree)**: 레이아웃의 부모-자식 관계와 상대적 비율을 관리합니다.
- **평면적 렌더링(Flat Rendering)**: React의 재조정(Reconciliation) 과정을 최적화하여 컴포넌트 상태를 보존합니다.

---

## 2. 레이아웃 트리 (Layout Tree)

### Node 유형 및 규칙
1. **BaseNode (공통 속성)**: 모든 노드의 기초가 되는 추상 클래스입니다.
   ```typescript
   abstract class BaseNode {
       private _id: number;
       private _width: number;
       private _height: number;
       private _top: number;
       private _left: number;
       abstract get type(): 'split' | 'item';
       // 부모 Split을 기준으로 레이아웃 계산
       applyLayout(parentSplit: GridSplit): void;
   }
   ```
2. **Container (Root)**: 트리의 시작점으로, 전체 `width`와 `height` 정보를 가집니다.
3. **Split (Branch)**: 영역을 가르는 분할선입니다.
   - 항상 2개의 자식(Primary, Secondary)을 가집니다.
   - `direction`(Horizontal/Vertical)과 `ratio`(0~1)를 통해 자식의 크기를 결정합니다.
4. **Item (Leaf)**: 실제 콘텐츠가 담기는 노드입니다.
   - 자식을 가질 수 없으며, 모든 리프 노드는 Item이어야 합니다.
   - 절대 좌표(`top`, `left`)와 크기(`width`, `height`)를 최종적으로 계산받아 UI로 표현됩니다.

### ID 체계
트리 내의 각 노드는 고유한 `id`를 가집니다. 초기에는 이진 트리 인덱싱 규칙을 따를 수 있으나, 드래그 앤 드롭 이후에는 새로운 노드에 대해 `maxId + 1` 전략을 사용하여 고유성을 유지합니다.

---

## 3. 핵심 동작 프로세스

### JSX → Tree 변환
개발자가 선언한 JSX 구조는 `parseChildren` 과정을 통해 `ComponentNode` 트리로 변환된 후, 레이아웃 엔진에 의해 실제 `Tree` 인스턴스로 빌드됩니다.

### 레이아웃 계산 알고리즘
부모로부터 물려받은 공간을 `ratio`에 따라 분할하여 자식에게 전달합니다.

```typescript
// 예: Vertical Split (좌우 분할)
primary.width = parent.width * ratio;
primary.left = parent.left;
secondary.width = parent.width - primary.width;
secondary.left = parent.left + primary.width;
```

---

## 4. 상태 보존 전략 (Flat Rendering)

React는 컴포넌트의 가상 DOM 위치가 바뀌면(부모가 바뀌면) 해당 컴포넌트를 언마운트 후 다시 마운트합니다. 이는 내부 상태(useState 등)를 초기화시킵니다.

### 문제 상황
사용자가 Item A를 다른 Split 아래로 드래그하면 트리의 깊이(depth)가 변합니다.
- **Before**: `Root -> Item A` (Depth 1)
- **After**: `Root -> Split -> Item A` (Depth 2)
- **결과**: React는 Item A를 새 컴포넌트로 인식하여 리셋함.

### 해결책: Flat Rendering
DndGrid는 트리를 순회하여 모든 **Item 노드만 추출**한 뒤, `DndGridContainer`의 **직계 자식**으로 평면적으로 렌더링합니다.

```tsx
<DndGridContainer>
  {/* 모든 Item이 같은 Depth(1) 상에서 렌더링됨 */}
  <DndGridItem id={1} top={...} left={...} />
  <DndGridItem id={2} top={...} left={...} />
</DndGridContainer>
```
이 방식 덕분에 드래그 앤 드롭으로 논리적 위치가 바뀌어도 React 입장에서는 동일한 부모(`Container`) 아래에 있는 동일한 `key`를 가진 컴포넌트이므로 상태가 보존됩니다.

---

## 5. Drag & Drop 로직

### 4분면(Quadrant) 계산
드롭될 위치를 결정하기 위해 대상 Item의 중심과 대각선을 기준으로 영역을 나눕니다.

```typescript
export const getQuadrantPosition = ({ mouseX, mouseY, startLeft, startTop, height, width }) => {
    // 대각선 방정식으로 4분면 계산 (inclineY: \, declineY: /)
    const inclineY = Math.round(((startLeft - mouseX) * height) / width + startTop + height);
    const declineY = Math.round(((mouseX - startLeft) * height) / width + startTop);

    if (mouseY <= inclineY && mouseY <= declineY) return 'top';
    if (mouseY <= inclineY && mouseY >= declineY) return 'left';
    if (mouseY >= inclineY && mouseY <= declineY) return 'right';
    return 'bottom';
};
```

### 트리 재구조화 및 Diff 알고리즘
드롭이 확정되면 Tree를 재구조화하고, 변경된 노드만 효율적으로 찾아내어 상태를 업데이트합니다.

```typescript
// Diff 알고리즘 핵심: 레이아웃과 자식 구조 변경 감지
diffWithSnapshot(snapshot: Map<number, any>): Set<number> {
    const changedIds = new Set<number>();
    const traverse = (node: ChildNode) => {
        const oldData = snapshot.get(node.id);
        if (!oldData || isLayoutChanged(oldData, node) || isStructureChanged(oldData, node)) {
            changedIds.add(node.id);
            // ... 자식들도 변경된 것으로 간주하거나 재귀 탐색
        }
    };
    traverse(this._root);
    return changedIds;
}
```

---

## 6. Next.js 및 Hydration 이슈

DndGrid는 브라우저 전용 API와 클라이언트 상태를 사용하므로, Next.js App Router 환경에서는 서버 렌더링 결과와 클라이언트 hydration 결과 간의 일치가 중요합니다.

- **"use client" 지시문**: 인터랙션이 발생하는 모든 컴포넌트(`Container`, `Split`, `Item`)에 선언되어 있습니다.
- **Hydration Mismatch 방지**: 첫 렌더링 시에는 서버에서 제공한 JSX 구조를 최대한 유지하고, 이후 드래그 발생 시에만 클라이언트 측 트리로 완전히 전환합니다.

---

## 참고 자료
상세한 이슈 해결 과정은 [Trouble shooting 가이드](./dnd-grid-trouble.md)를 확인하세요.
