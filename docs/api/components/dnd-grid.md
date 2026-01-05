# DndGrid Architecture

`DndGrid`는 **트리 기반 레이아웃 모델**을 사용하는 Drag & Drop 그리드 시스템입니다.
Split / Item 컴포넌트를 조합하여 IDE, 대시보드, 에디터와 같은 **복잡한 레이아웃**을 안정적으로 구성할 수 있도록 설계되었습니다.

이 문서는 DndGrid의 **핵심 설계 철학, 내부 구조, 상태 보존 전략, 코어 구현**을 설명합니다.

---

## 목차

1. [설계 목표](#설계-목표)
2. [전체 구조 개요](#전체-구조-개요)
3. [핵심 개념: Layout Tree](#핵심-개념-layout-tree)
4. [Drag & Drop 구현](#drag--drop-구현)
5. [상태 보존 전략](#상태-보존-전략)
6. [확장 가능성](#확장-가능성)

---

## 설계 목표

DndGrid는 다음 문제를 해결하기 위해 설계되었습니다.

-   선언적인 JSX 기반 레이아웃 정의로 직관적인 그리드 레이아웃 구성
-   그리드 레이아웃에 Drag & Drop 기능 추가 


## 전체 구조 개요

```
DndGridContainer
└── Tree Root
    └── Split Node (id=1)
        ├── Item Node (id=2)
        └── Split Node (id=3)
            ├── Item Node (id=6)
            └── Item Node (id=7)
    
```

---

## 핵심 개념: Layout Tree

### Node 타입

DndGrid는 내부적으로 다음 두 가지 Node 타입을 가집니다.

| Node        | 설명                                |
| ----------- | ----------------------------------- |
| `GridSplit` | 영역을 분할하는 노드 (이진 트리)    |
| `GridItem`  | 실제 콘텐츠를 담는 노드 (리프 노드) |

### BaseNode - 공통 속성

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

**핵심 특징:**

-   모든 Node는 `id`, `width`, `height`, `top`, `left` 속성 보유
-   `position: absolute`로 배치되어 독립적인 위치 계산
-   부모 Split의 `direction`과 `ratio`를 기준으로 자동 레이아웃

### GridSplit - 분할 노드

```typescript
class GridSplit extends BaseNode {
    readonly type = 'split';
    private _direction: 'horizontal' | 'vertical';
    private _ratio: number; // 0.0 ~ 1.0
    private _primaryChild: ChildNode;
    private _secondaryChild: ChildNode;
}
```

**특징:**

-   항상 **정확히 2개의 자식** (이진 트리)
-   자식은 Split 또는 Item이어야 한다.
-   `ratio`: primary 자식의 비율 (0.5 = 50:50)
-   `direction`: 분할 방향
    -   `horizontal`: 상하 분할
    -   `vertical`: 좌우 분할
-   재귀적으로 중첩 가능
-   Primary child: Split direction이 vertical이면 left, horizontal이면 top에 위치한 자식
-   Secondary child: Split direction이 vertical이면 right, horizontal이면 bottom에 위치한 자식

### GridItem - 콘텐츠 노드

```typescript
class GridItem extends BaseNode {
    readonly type = 'item';
    readonly children: React.ReactNode;
}
```

**특징:**

-   레이아웃 트리의 **리프 노드**. 자식을 가질 수 없음
-   실제 UI에 보여질 컴포넌트 포함
-   DnD 시에도 **동일한 인스턴스 유지** → 상태 보존


## 코어: JSX → UI

DndGrid의 핵심은 **선언적 JSX를 통해 내부에선 Tree 구조로 변환하고, Tree를 기반으로 UI를 렌더링**하는 것입니다.

개발자는 다음과 같이 선언적으로 레이아웃을 정의합니다.

```tsx
<DndGridContainer width={800} height={600}>
    <DndGridSplit direction="horizontal" ratio={0.5}>
        <DndGridItem>
            <YourComponent />
        </DndGridItem>
        <DndGridItem>
            <AnotherComponent />
        </DndGridItem>
    </DndGridSplit>
</DndGridContainer>
```

**레이아웃 내부 계산 로직 (BaseNode.applyLayout):**

```typescript
// Horizontal Split (상하 분할) - ratio=0.3 예시
parent.width = 800, parent.height = 600
├── primaryChild (30%)
│   width = parent.width = 800
│   height = parent.height * ratio = 600 * 0.3 = 180
│   top = parent.top = 0
│   left = parent.left = 0
└── secondaryChild (70%)
    width = parent.width = 800
    height = parent.height - primaryChild.height = 420
    top = parent.top + primaryChild.height = 180
    left = parent.left = 0

// Vertical Split (좌우 분할) - ratio=0.4 예시
parent.width = 800, parent.height = 600
├── primaryChild (40%)
│   width = parent.width * ratio = 800 * 0.4 = 320
│   height = parent.height = 600
│   top = parent.top = 0
│   left = parent.left = 0
└── secondaryChild (60%)
    width = parent.width - primaryChild.width = 480
    height = parent.height = 600
    top = parent.top = 0
    left = parent.left + primaryChild.width = 320
```


## Drag & Drop

### 이벤트 흐름

```
1. onMouseDown (Item-Drag)
   ↓
2. startDrag(itemId) → Zustand에 draggedItemId 저장
   ↓
3. onMouseEnter (다른 Item)
   ↓
4. setHoveredItem(itemId) → Zustand에 hoveredItemId 저장
   ↓
5. onMouseMove (Item)
   ↓
6. calculateQuadrant(mouseX, mouseY) → 드롭 위치 계산
   ↓
7. setDropQuadrant(quadrant) → 'top' | 'left' | 'right' | 'bottom'
   ↓
8. onMouseUp (전역)
   ↓
9. endDrag() → Tree 재구조화
```

### Quadrant 계산 (드롭 위치 결정)

-   드랍 컨텐츠의 top left를 기준으로 width와 height을 통해 대각선 꼭지점을 지나는 두개의 일차 방정식을 구한 뒤 드랍 될 위치의 top left bottom right를 결정

```typescript:src/actions/dnd-grid/util.ts
export const getQuadrantPosition = ({
    mouseX,
    mouseY,
    startLeft,  // Item의 left
    startTop,   // Item의 top
    height,
    width,
}: CalculateQuadrantProps): DropQuadrant => {
    // 대각선 방정식으로 4분면 계산
    const inclineY = Math.round(
        ((startLeft - mouseX) * height) / width + startTop + height
    );

    const declineY = Math.round(
        ((mouseX - startLeft) * height) / width + startTop
    );

    if (mouseY <= inclineY && mouseY <= declineY) return 'top';
    if (mouseY <= inclineY && mouseY >= declineY) return 'left';
    if (mouseY >= inclineY && mouseY <= declineY) return 'right';
    return 'bottom';
};
```

**시각적 표현:**

```
┌─────────────────┐
│\               /│
│  \    top    /  │
│    \       /    │
│ left  ✕  right │
│    /       \    │
│  /  bottom  \  │
│/               \│
└─────────────────┘
```


### Diff 알고리즘 (React Reconciliation 스타일)

```typescript:src/actions/dnd-grid/tree.ts
createSnapshot(): Map<number, SnapshotData> {
    const snapshot = new Map();

    const traverse = (node: ChildNode) => {
        snapshot.set(node.id, {
            id: node.id,
            width: node.width,
            height: node.height,
            top: node.top,
            left: node.left,
            primaryChildId: node.type === 'split' ? node.primaryChild.id : undefined,
            secondaryChildId: node.type === 'split' ? node.secondaryChild.id : undefined,
        });

        if (node.type === 'split') {
            traverse(node.primaryChild);
            traverse(node.secondaryChild);
        }
    };

    traverse(this._root);
    return snapshot;
}

diffWithSnapshot(snapshot: Map<number, any>): Set<number> {
    const changedIds = new Set<number>();

    const traverse = (node: ChildNode) => {
        const oldData = snapshot.get(node.id);

        // 새로 추가된 노드
        if (!oldData) {
            this.collectAllDescendants(node, changedIds);
            return;
        }

        // 레이아웃 변경 체크
        const layoutChanged =
            oldData.width !== node.width ||
            oldData.height !== node.height ||
            oldData.top !== node.top ||
            oldData.left !== node.left;

        if (layoutChanged) {
            changedIds.add(node.id);
        }

        // Split 구조 변경 체크
        if (node.type === 'split') {
            const structureChanged =
                oldData.primaryChildId !== node.primaryChild.id ||
                oldData.secondaryChildId !== node.secondaryChild.id;

            if (structureChanged) {
                changedIds.add(node.id);
                this.collectAllDescendants(node.primaryChild, changedIds);
                this.collectAllDescendants(node.secondaryChild, changedIds);
            } else {
                traverse(node.primaryChild);
                traverse(node.secondaryChild);
            }
        }
    };

    traverse(this._root);
    return changedIds;
}
```

**최적화 포인트:**

-   변경되지 않은 Node는 복제하지 않음 (참조 유지)
-   Zustand가 참조 동일성으로 변경 감지
-   최소한의 리렌더링만 발생

---

## 상태 보존 전략

### 문제: DnD 후 children 상태 초기화

```tsx
function AA() {
    const [count, setCount] = useState(0);
    return <div onClick={() => setCount((v) => v + 1)}>{count}</div>;
}


// DnD 전: count = 3
// DnD 후: count = 0 ← 리마운트로 인한 초기화
```

### 시도 1: cloneElement (실패)

**가설:** `React.createElement`가 매번 새 엘리먼트를 생성하여 리마운트

**해결책:** 원본 엘리먼트를 캐시하고 `cloneElement` 사용

```typescript
// parseChildren에서 원본 저장
saveElementToCache(nodeId, node);

// buildReactTreeFromNode에서 cloneElement
const cachedElement = getElementFromCache(item.id);
return React.cloneElement(cachedElement, {
    id: item.id,
    top: item.top,
    // ... layout props만 업데이트
});
```

**결과:** ❌ 여전히 초기화됨

**이유:** React Reconciliation은 **트리 위치(depth)**도 비교

```tsx
// Before
<Split depth=1>
  <Item depth=2 key=2><AA /></Item>  ← depth 2
</Split>

// After (새 Split 생성)
<Split depth=1>
  <Split depth=2>  ← 새로 생성
    <Item depth=3 key=2><AA /></Item>  ← depth 3 (변경!)
  </Split>
</Split>

// React 판단: depth가 다름 → 다른 컴포넌트 → 리마운트
```

### 시도 2: Flat 렌더링 (성공) ✅

**핵심 아이디어:** 모든 Item을 **같은 depth**에 렌더링

```tsx
// Flat 구조
<DndGridContainer>
  <DndGridItem id=2 key=2 top={0} left={0}><AA /></DndGridItem>
  <DndGridItem id=3 key=3 top={0} left={400} />
  <DndGridItem id=5 key=5 top={300} left={0} />
</DndGridContainer>
```

**React Reconciliation 체크:**

1. ✅ 타입: `DndGridItem` (동일)
2. ✅ Key: `id=2` (동일)
3. ✅ **Depth: 1 (항상 동일!)**

**결과:** React가 같은 컴포넌트로 인식 → 재사용 → **상태 유지**

### 구현: collectAllItems + cloneElement

```typescript
// 1. Tree에서 모든 Item 추출 (flat array)
const items = collectAllItems(tree.root);

// 2. 각 Item을 cloneElement로 렌더링
const renderedItems = items.map((item) => {
    const cachedElement = getElementFromCache(item.id);
    const cachedChildren = getChildrenFromCache(item.id);

    return React.cloneElement(cachedElement, {
        key: item.id,
        id: item.id,
        top: item.top,
        left: item.left,
        width: item.width,
        height: item.height,
        children: cachedChildren, // 원본 children 참조 유지
    });
});

// 3. Flat 배열로 렌더링
setEnhancedChildren(renderedItems);
```

### 캐싱 전략

```typescript
// Store
interface TreeStore {
    childrenCache: Map<number, React.ReactNode>;
    elementsCache: Map<number, React.ReactElement>;

    saveChildrenToCache(id: number, children: React.ReactNode): void;
    saveElementToCache(id: number, element: React.ReactElement): void;
}

// parseChildren에서 캐싱
saveElementToCache(nodeId, node); // 원본 <DndGridItem> 엘리먼트
saveChildrenToCache(nodeId, props.children); // 원본 <AA /> children

// rebuildTree에서 사용
const cachedElement = getElementFromCache(item.id); // 참조 유지
const cachedChildren = getChildrenFromCache(item.id); // 참조 유지
```

**왜 두 개를 캐싱하는가?**

1. **elementsCache**: `React.cloneElement`를 위한 원본 엘리먼트

    - 동일한 React 엘리먼트 참조 유지
    - React의 fiber reconciliation에서 재사용 가능

2. **childrenCache**: 사용자 컴포넌트 참조 유지
    - `<AA />` 같은 실제 children
    - props 변경 없이 동일 참조 유지

### 결과

```tsx
// DnD 전
<AA /> → count = 3

// DnD 실행 (Tree 재구조화)
restructureByDrop() → Tree 변경 → rebuildTree()

// DnD 후
<AA /> → count = 3  ✅ 상태 유지!
```

---

## 확장 가능성

현재 구조를 기반으로 다음 기능을 자연스럽게 확장할 수 있습니다.

### 1. Split 비율 Resize

```typescript
// Split에 리사이즈 핸들 추가
class GridSplit extends BaseNode {
    setRatio(newRatio: number) {
        this._ratio = newRatio;
        // 레이아웃 재계산
        if (this.parent) {
            this.parent.calculateLayout();
        }
    }
}

// UI: 드래그로 ratio 조정
<div className="resize-handle" onMouseDown={handleResizeStart} />;
```

### 2. Layout 저장 / 복원 (직렬화)

```typescript
// Tree → JSON
export function serializeTree(tree: Tree): SerializedTree {
    const serialize = (node: ChildNode): SerializedNode => {
        if (node.type === 'item') {
            return {
                type: 'item',
                id: node.id,
                // children은 직렬화 불가 (함수/컴포넌트)
            };
        }

        return {
            type: 'split',
            id: node.id,
            direction: node.direction,
            ratio: node.ratio,
            primary: serialize(node.primaryChild),
            secondary: serialize(node.secondaryChild),
        };
    };

    return {
        root: serialize(tree.root),
        width: tree.root.width,
        height: tree.root.height,
    };
}

// JSON → Tree
export function deserializeTree(data: SerializedTree): Tree {
    // ComponentNode 재구성 후 Tree 생성
}

// 사용
localStorage.setItem('layout', JSON.stringify(serializeTree(tree)));
const savedLayout = JSON.parse(localStorage.getItem('layout'));
const restoredTree = deserializeTree(savedLayout);
```

### 3. Undo / Redo

```typescript
// History Stack
interface HistoryState {
    tree: SerializedTree;
    timestamp: number;
}

const historyStack: HistoryState[] = [];
let currentIndex = -1;

// Undo
function undo() {
    if (currentIndex > 0) {
        currentIndex--;
        const state = historyStack[currentIndex];
        restoreTree(deserializeTree(state.tree));
    }
}

// Redo
function redo() {
    if (currentIndex < historyStack.length - 1) {
        currentIndex++;
        const state = historyStack[currentIndex];
        restoreTree(deserializeTree(state.tree));
    }
}

// endDrag 시 히스토리 저장
endDrag: () => {
    // ... Tree 재구조화

    // 히스토리 저장
    historyStack.splice(currentIndex + 1); // 현재 이후 제거
    historyStack.push({
        tree: serializeTree(tree),
        timestamp: Date.now(),
    });
    currentIndex++;
};
```

### 4. 외부 Drag Source

```typescript
// 외부에서 새 Item 드래그
<ExternalDragSource>
    <NewComponent />
</ExternalDragSource>;

// Drop 시 새 Item 추가
function insertNewItem(
    dropTargetId: number,
    quadrant: DropQuadrant,
    newComponent: React.ReactNode
) {
    const newId = tree.generateNewId();
    const newItem = new GridItem(newId, newComponent);

    // Tree에 삽입
    tree.insertItemAt(newItem, dropTargetId, quadrant);

    // 캐시 저장
    saveElementToCache(newId, <DndGridItem>{newComponent}</DndGridItem>);
    saveChildrenToCache(newId, newComponent);
}
```

### 5. 서버 기반 Layout 동기화

```typescript
// WebSocket으로 실시간 동기화
socket.on('layout-changed', (data: SerializedTree) => {
    const newTree = deserializeTree(data);
    updateTree(newTree);
});

// 로컬 변경 시 브로드캐스트
endDrag: () => {
    // ... Tree 재구조화

    socket.emit('layout-change', serializeTree(tree));
};
```

---

## 요약

### 핵심 설계 원칙

1. **논리적 구조 vs 렌더링 구조 분리**

    - 논리: Tree (Split + Item)
    - 렌더링: Flat (Item만)

2. **상태의 단일 진실 소스: Tree**

    - JSX는 초기 입력일 뿐
    - 모든 변경은 Tree를 통해

3. **React Reconciliation 이해**

    - Type + Key + **Tree Position** 모두 일치해야 재사용
    - Flat 렌더링으로 Position 고정

4. **최소 변경 원칙**
    - Diff 알고리즘으로 변경된 Node만 복제
    - 참조 동일성으로 최소 리렌더

### 데이터 흐름

```
JSX
 ↓ parseChildren
ComponentNode
 ↓ buildTree
Tree (GridSplit + GridItem)
 ↓ calculateLayout
Node { id, top, left, width, height }
 ↓ collectAllItems
Item[]
 ↓ cloneElement (cachedElement + cachedChildren)
React Element[]
 ↓ render
UI (position: absolute)
```

### DnD 흐름

```
Drag Start
 ↓
Mouse Move → Quadrant 계산
 ↓
Drop
 ↓
restructureByDrop → Tree 변경
 ↓
Diff → 변경된 Node 추출
 ↓
cloneAffectedNodes → 최소 복제
 ↓
Zustand 업데이트
 ↓
rebuildTree → Flat 렌더링
 ↓
React Reconciliation → 최소 리렌더
```

### 상태 보존 메커니즘

```
1. elementsCache: 원본 React Element 참조
2. childrenCache: 원본 children 참조
3. Flat 렌더링: 항상 같은 depth
4. cloneElement: 참조 유지하며 props만 업데이트

→ React가 같은 컴포넌트로 인식
→ 상태 유지
```

---



## 참고 자료

-   [React Reconciliation](https://react.dev/learn/preserving-and-resetting-state)
-   [React Keys](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)
-   [React.cloneElement](https://react.dev/reference/react/cloneElement)
-   [Zustand](https://github.com/pmndrs/zustand)
-   [Next.js Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
-   [Next.js "use client" Directive](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
