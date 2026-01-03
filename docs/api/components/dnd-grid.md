# DndGrid Component - React State Preservation 트러블슈팅

## 문제 상황

DnD Grid 컴포넌트에서 드래그 앤 드롭 후 **children 컴포넌트의 상태가 초기화**되는 문제가 발생했습니다.

```tsx
function AA() {
    const [count, setCount] = useState(0);
    return <div onClick={() => setCount(v => v + 1)}>{count}</div>;
}

// DndGrid 사용
<DndGridContainer>
    <DndGridItem>
        <AA /> {/* DnD 후 count가 0으로 리셋됨 */}
    </DndGridItem>
</DndGridContainer>
```

**증상:**
- DnD 전: `<AA />` 컴포넌트를 클릭하여 count를 3까지 증가
- DnD 실행: Item을 다른 위치로 드래그
- DnD 후: count가 0으로 초기화 (상태 손실)

## 원인 분석

### 1차 분석: React.createElement vs cloneElement

처음에는 `buildReactTreeFromNode` 함수가 매번 `React.createElement`로 새로운 엘리먼트를 생성하는 것이 원인으로 추정했습니다.

```typescript:src/actions/dnd-grid/util.ts
// ❌ 문제가 되는 코드
export function buildReactTreeFromNode(treeNode: ChildNode) {
    if (treeNode.type === 'item') {
        return React.createElement(DndGridItem, {  // 매번 새 엘리먼트 생성
            id: treeNode.id,
            children: cachedChildren,
        });
    }
}
```

**해결 시도 1: 원본 엘리먼트 캐싱 + cloneElement**

```typescript
// store에 elementsCache 추가
elementsCache: Map<number, React.ReactElement>

// parseChildren에서 원본 저장
saveElementToCache(nodeId, node);

// buildReactTreeFromNode에서 cloneElement 사용
const cachedElement = getElementFromCache(item.id);
return React.cloneElement(cachedElement, {
    id: item.id,
    top: item.top,
    // ... layout props만 업데이트
});
```

**결과:** ❌ 여전히 초기화됨

### 2차 분석: React Reconciliation과 트리 구조

문제의 진짜 원인은 **React의 reconciliation 알고리즘**이었습니다.

#### DnD 시 트리 구조 변경

```tsx
// 초기 구조
<DndGridSplit id=1>
  <DndGridItem id=2 key=2>  ← depth: 2
    <AA />
  </DndGridItem>
  <DndGridItem id=3 key=3 />
</DndGridSplit>

// DnD 후 - 새로운 Split(id=4) 생성
<DndGridSplit id=1>
  <DndGridSplit id=4>  ← 새 Split 추가!
    <DndGridItem id=2 key=2>  ← depth: 3 (변경!)
      <AA />
    </DndGridItem>
    <DndGridItem id=3 key=3 />
  </DndGridSplit>
  <DndGridItem id=5 key=5 />
</DndGridSplit>
```

#### React Reconciliation 규칙

React는 다음 규칙으로 컴포넌트를 재사용할지 결정합니다:

1. **같은 타입의 엘리먼트**인가?
2. **같은 key**를 가지고 있는가?
3. ⚠️ **같은 트리 위치(depth)**에 있는가?

우리의 경우:
- ✅ 타입: `DndGridItem` (동일)
- ✅ Key: `id=2` (동일)
- ❌ **트리 위치: depth 2 → 3 (변경!)**

**React의 판단:** 다른 위치에 있는 새로운 컴포넌트 → **언마운트 후 리마운트**

#### 핵심 문제점

```typescript
// Item의 ID는 변경되지 않음 (id=2 유지)
// elementsCache도 정상 작동 (cloneElement 성공)
// children 참조도 보존됨

// 하지만...
// 부모 Split이 바뀌면서 트리 구조가 변경됨
// React는 트리 위치를 보고 "다른 컴포넌트"로 판단
// → 리마운트 → 상태 초기화
```

## 해결 과정

### 접근 1: 원본 엘리먼트 참조 보존 (실패)

원본 React 엘리먼트의 참조를 캐시하고 `cloneElement`로 복제하는 방식을 시도했으나, 트리 구조 변경 문제를 해결하지 못했습니다.

### 접근 2: Flat 렌더링 구조 (성공) ✅

**핵심 아이디어:** Split을 렌더링하지 않고, 모든 Item을 Container의 직계 자식으로 flat하게 렌더링

```tsx
// Before: 트리 구조 렌더링
<DndGridContainer>
  <DndGridSplit>
    <DndGridSplit>
      <DndGridItem id=2><AA /></DndGridItem>
    </DndGridSplit>
  </DndGridSplit>
</DndGridContainer>

// After: Flat 렌더링
<DndGridContainer>
  <DndGridItem id=2><AA /></DndGridItem>  ← 항상 depth 1 유지
  <DndGridItem id=3 />
  <DndGridItem id=5 />
</DndGridContainer>
```

**왜 작동하는가?**
- 모든 Item이 **항상 같은 depth (Container의 직계 자식)**
- DnD 후에도 트리 위치 변경 없음
- React가 같은 컴포넌트로 인식 → 재사용 → **상태 유지**

## 최종 해결책

### 1. collectAllItems 유틸리티 추가

Tree를 순회하여 모든 Item 노드만 추출하는 함수를 작성했습니다.

```typescript:src/actions/dnd-grid/util.ts
/**
 * Tree를 순회하여 모든 Item 노드를 flat array로 수집
 * Split은 무시하고 Item만 추출
 */
export function collectAllItems(treeNode: ChildNode): ChildNode[] {
    const items: ChildNode[] = [];

    const traverse = (node: ChildNode) => {
        if (node.type === 'item') {
            items.push(node);
        } else if (node.type === 'split') {
            // Split은 렌더링하지 않고 자식만 탐색
            traverse(node.primaryChild);
            traverse(node.secondaryChild);
        }
    };

    traverse(treeNode);
    return items;
}
```

### 2. Container 렌더링 로직 변경

DnD 후 재빌드 시 모든 Item을 flat하게 렌더링하도록 수정했습니다.

```typescript:src/components/dnd-grid/container.tsx
const rebuildTree = useCallback(() => {
    const tree = useTreeStore.getState().tree;

    if (!tree) {
        // 초기 빌드 - 기존 로직 유지 (트리 구조로 렌더링)
        const componentTree = parseChildren(children, {
            DndGridSplit,
            DndGridItem,
        });
        const newTree = buildTree(componentTree, width, height);
        const injected = injectLayoutToChildren(children, newTree.root, {
            DndGridSplit,
            DndGridItem,
        });
        setEnhancedChildren(injected);
    } else {
        // DnD 후 - Flat 렌더링
        const items = collectAllItems(tree.root);
        const getElementFromCache = useTreeStore.getState().getElementFromCache;
        const getChildrenFromCache = useTreeStore.getState().getChildrenFromCache;

        const renderedItems = items.map((item) => {
            const cachedElement = getElementFromCache(item.id);
            const cachedChildren = getChildrenFromCache(item.id);

            // 원본 엘리먼트가 있으면 cloneElement로 참조 유지
            if (cachedElement) {
                return React.cloneElement(cachedElement, {
                    key: item.id,
                    id: item.id,
                    top: item.top,
                    left: item.left,
                    width: item.width,
                    height: item.height,
                    children: cachedChildren ?? item.children,
                });
            }

            // fallback: createElement
            return React.createElement(DndGridItem, {
                key: item.id,
                id: item.id,
                top: item.top,
                left: item.left,
                width: item.width,
                height: item.height,
                children: cachedChildren ?? item.children,
            });
        });

        setEnhancedChildren(renderedItems);
    }
}, [children, width, height, buildTree]);
```

### 3. 핵심 변경점

**Before:**
```typescript
// buildReactTreeFromNode로 Split과 Item을 중첩된 트리 구조로 렌더링
const updated = buildReactTreeFromNode(tree.root, {
    DndGridSplit,
    DndGridItem,
});
```

**After:**
```typescript
// collectAllItems로 Item만 추출하여 flat하게 렌더링
const items = collectAllItems(tree.root);
const renderedItems = items.map(item => /* cloneElement or createElement */);
```

## 결과

### ✅ 문제 해결

- **상태 보존:** DnD 후에도 `<AA />` 컴포넌트의 count 상태 유지
- **React.memo 작동:** children 컴포넌트가 React.memo로 감싸져 있어도 정상 작동
- **참조 유지:** 원본 React 엘리먼트 참조와 children 참조 모두 보존

### 렌더링 구조 비교

```tsx
// Before (문제 있음)
<DndGridContainer>
  <DndGridSplit depth=1>
    <DndGridSplit depth=2>  ← DnD 후 추가됨
      <DndGridItem depth=3><AA /></DndGridItem>  ← depth 변경으로 리마운트
    </DndGridSplit>
  </DndGridSplit>
</DndGridContainer>

// After (해결)
<DndGridContainer>
  <DndGridItem depth=1><AA /></DndGridItem>  ← 항상 depth 1 유지
  <DndGridItem depth=1 />
  <DndGridItem depth=1 />
</DndGridContainer>
```

### 레이아웃은 어떻게?

Split은 렌더링되지 않지만, Tree 구조는 여전히 유지됩니다:
- Tree에서 각 Item의 `top`, `left`, `width`, `height` 계산
- 각 Item을 `position: absolute`로 배치
- 시각적으로는 동일한 레이아웃 유지

## 핵심 교훈

### 1. React Reconciliation 이해의 중요성

React는 다음을 모두 확인하여 컴포넌트 재사용 여부를 결정합니다:
- 컴포넌트 타입
- key 값
- **트리 위치 (depth)**

엘리먼트 참조나 children 참조를 보존하는 것만으로는 부족하며, **트리 구조 자체가 유지**되어야 합니다.

### 2. 논리적 구조 vs 렌더링 구조 분리

- **논리적 구조:** Tree (Split과 Item의 계층 구조)
- **렌더링 구조:** Flat (모든 Item을 같은 depth)

둘을 분리하여 논리적 구조로 레이아웃을 계산하되, 렌더링은 flat하게 수행함으로써 상태 보존과 올바른 레이아웃을 동시에 달성했습니다.

### 3. 상태 보존 전략

React 컴포넌트 상태를 보존하려면:
1. **key를 일관되게 유지**
2. **트리 위치를 변경하지 않음**
3. 엘리먼트 참조 보존 (cloneElement)
4. children 참조 보존 (캐싱)

단순히 참조만 보존하는 것이 아니라, React가 인식하는 **트리 구조를 일관되게 유지**하는 것이 핵심입니다.

## 참고 자료

- [React Reconciliation](https://react.dev/learn/preserving-and-resetting-state)
- [React Keys](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)
- [React.cloneElement](https://react.dev/reference/react/cloneElement)
