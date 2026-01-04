# DndGrid Architecture

`DndGrid`는 **트리 기반 레이아웃 모델**을 사용하는 Drag & Drop 그리드 시스템입니다.
Split / Item 컴포넌트를 조합하여 IDE, 대시보드, 에디터와 같은 **복잡한 레이아웃**을 안정적으로 구성할 수 있도록 설계되었습니다.

이 문서는 DndGrid의 **핵심 설계 철학, 내부 구조, 상태 보존 전략, 코어 구현**을 설명합니다.

---

## 목차

1. [설계 목표](#설계-목표)
2. [전체 구조 개요](#전체-구조-개요)
3. [핵심 개념: Layout Tree](#핵심-개념-layout-tree)
4. [코어 구현: JSX → Tree → UI](#코어-구현-jsx--tree--ui)
5. [Drag & Drop 구현](#drag--drop-구현)
6. [상태 보존 전략](#상태-보존-전략)
7. [확장 가능성](#확장-가능성)

---

## 설계 목표

DndGrid는 다음 문제를 해결하기 위해 설계되었습니다.

-   중첩 가능한 분할 레이아웃
-   Drag & Drop 이후에도 **컴포넌트 상태 보존**
-   불필요한 리렌더링 최소화
-   선언적인 JSX 기반 레이아웃 정의
-   확장 가능한 구조 (DnD, Resize, Serialize)

---

## 전체 구조 개요

```
DndGridContainer
└── Tree Root
    ├── Split Node (id=1)
    │   ├── Item Node (id=2)
    │   └── Split Node (id=3)
    │       ├── Item Node (id=6)
    │       └── Item Node (id=7)
    └── Item Node (id=4)
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
-   `ratio`: primary 자식의 비율 (0.5 = 50:50)
-   `direction`: 분할 방향
    -   `horizontal`: 상하 분할
    -   `vertical`: 좌우 분할
-   재귀적으로 중첩 가능

### GridItem - 콘텐츠 노드

```typescript
class GridItem extends BaseNode {
    readonly type = 'item';
    readonly children: React.ReactNode;
}
```

**특징:**

-   레이아웃 트리의 **리프 노드**
-   실제 사용자 컴포넌트(`<AA />`)를 포함
-   DnD 시에도 **동일한 인스턴스 유지** → 상태 보존

### ID 체계: 이진 트리 인덱싱

```
Root (id=1)
├── Primary (id=2 = 1*2)
│   ├── Primary (id=4 = 2*2)
│   └── Secondary (id=5 = 2*2+1)
└── Secondary (id=3 = 1*2+1)
    ├── Primary (id=6 = 3*2)
    └── Secondary (id=7 = 3*2+1)
```

**규칙:**

-   Root의 ID는 항상 `1`
-   Primary child: `parentId * 2`
-   Secondary child: `parentId * 2 + 1`

**장점:**

-   부모-자식 관계를 ID만으로 추론 가능
-   DnD 후 새 Split 생성 시 고유 ID 보장 (`maxId + 1`)

---

## 코어 구현: JSX → Tree → UI

DndGrid의 핵심은 **선언적 JSX를 내부 Tree 구조로 변환하고, Tree를 기반으로 UI를 렌더링**하는 것입니다.

### 1단계: JSX 선언

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

### 2단계: JSX → ComponentNode 파싱

`parseChildren` 함수가 JSX를 중간 표현인 `ComponentNode`로 변환합니다.

```typescript:src/actions/dnd-grid/util.ts
export function parseChildren(
    node: React.ReactNode,
    options: ParseChildrenOptions,
    parentId: number = 0
): ComponentNode | null {
    if (!React.isValidElement(node)) return null;

    const nodeId = parentId === 0 ? 1 : parentId;

    // DndGridSplit 처리
    if (node.type === DndGridSplit) {
        const props = node.props;
        const childrenArray = React.Children.toArray(props.children);

        const primary = parseChildren(childrenArray[0], options, nodeId * 2);
        const secondary = parseChildren(childrenArray[1], options, nodeId * 2 + 1);

        // 원본 엘리먼트를 캐시에 저장 (상태 보존용)
        saveElementToCache(nodeId, node);

        return {
            type: 'split',
            id: nodeId,
            direction: props.direction,
            ratio: props.ratio,
            primary,
            secondary,
        };
    }

    // DndGridItem 처리
    saveElementToCache(nodeId, node);
    saveChildrenToCache(nodeId, props.children);

    return {
        type: 'item',
        id: nodeId,
        children: props.children,
    };
}
```

**핵심 포인트:**

1. **재귀적 파싱**: Split의 자식도 재귀적으로 파싱
2. **ID 자동 할당**: 이진 트리 인덱싱 규칙 적용
3. **원본 캐싱**: `React.cloneElement`를 위해 원본 엘리먼트 저장

### 3단계: ComponentNode → Tree 생성

`Tree` 클래스가 `ComponentNode`를 실제 Tree 인스턴스로 변환합니다.

```typescript:src/actions/dnd-grid/tree.ts
class Tree {
    private _root: ChildNode;

    constructor(
        containerWidth: number,
        containerHeight: number,
        componentsRootNode: ComponentNode
    ) {
        // 1. ComponentNode → ChildNode 변환
        this._root = this.buildFromComponentNode(componentsRootNode);

        // 2. Root에 Container 크기 적용
        this._root.width = containerWidth;
        this._root.height = containerHeight;
        this._root.top = 0;
        this._root.left = 0;

        // 3. 재귀적으로 모든 자식 레이아웃 계산
        if (this._root.type === 'split') {
            this.calculateLayout(this._root);
        }
    }

    private buildFromComponentNode(node: ComponentNode): ChildNode {
        if (node.type === 'item') {
            return new GridItem(node.id, node.children);
        }

        // Split의 경우 재귀적으로 자식 생성
        const primary = this.buildFromComponentNode(node.primary!);
        const secondary = this.buildFromComponentNode(node.secondary!);

        return new GridSplit(
            node.id,
            node.direction!,
            node.ratio!,
            primary,
            secondary
        );
    }

    private calculateLayout(parent: GridSplit): void {
        // 자식들에게 부모 기준으로 레이아웃 적용
        parent.primaryChild.applyLayout(parent);
        parent.secondaryChild.applyLayout(parent);

        // 자식이 Split이면 재귀
        if (parent.primaryChild.type === 'split') {
            this.calculateLayout(parent.primaryChild);
        }
        if (parent.secondaryChild.type === 'split') {
            this.calculateLayout(parent.secondaryChild);
        }
    }
}
```

**레이아웃 계산 로직 (BaseNode.applyLayout):**

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

### 4단계: Tree → React Element 렌더링 (Flat 구조)

**문제:** 트리 구조 그대로 렌더링하면 DnD 시 depth 변경 → 리마운트 → 상태 초기화

**해결:** 모든 Item을 **flat하게** 렌더링

```typescript:src/components/dnd-grid/container.tsx
const rebuildTree = useCallback(() => {
    const tree = useTreeStore.getState().tree;

    if (!tree) {
        // 초기 빌드: 기존 JSX 구조 유지
        const componentTree = parseChildren(children, { DndGridSplit, DndGridItem });
        const newTree = buildTree(componentTree, width, height);
        const injected = injectLayoutToChildren(children, newTree.root, {
            DndGridSplit,
            DndGridItem,
        });
        setEnhancedChildren(injected);
    } else {
        // DnD 후: Flat 렌더링
        const items = collectAllItems(tree.root); // 모든 Item 추출

        const renderedItems = items.map(item => {
            const cachedElement = getElementFromCache(item.id);
            const cachedChildren = getChildrenFromCache(item.id);

            // cloneElement로 원본 참조 유지
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

            return React.createElement(DndGridItem, {
                key: item.id,
                // ... props
                children: cachedChildren ?? item.children,
            });
        });

        setEnhancedChildren(renderedItems);
    }
}, [children, width, height, buildTree]);
```

```typescript:src/actions/dnd-grid/util.ts
// Tree에서 모든 Item만 추출
export function collectAllItems(treeNode: ChildNode): ChildNode[] {
    const items: ChildNode[] = [];

    const traverse = (node: ChildNode) => {
        if (node.type === 'item') {
            items.push(node);
        } else if (node.type === 'split') {
            traverse(node.primaryChild);
            traverse(node.secondaryChild);
        }
    };

    traverse(treeNode);
    return items;
}
```

**렌더링 결과:**

```tsx
// Before (트리 구조) - depth 변경 시 리마운트
<DndGridContainer>
  <DndGridSplit id=1>
    <DndGridSplit id=4>  ← 새로 생성
      <DndGridItem id=2 depth=3><AA /></DndGridItem>  ← 리마운트!
    </DndGridSplit>
  </DndGridSplit>
</DndGridContainer>

// After (Flat 구조) - 항상 같은 depth
<DndGridContainer>
  <DndGridItem id=2 key=2 top={0} left={0}><AA /></DndGridItem>
  <DndGridItem id=3 key=3 top={0} left={400} />
  <DndGridItem id=5 key=5 top={300} left={0} />
</DndGridContainer>
```

**핵심:**

-   Split은 렌더링하지 않음 (논리적 구조만 유지)
-   모든 Item은 Container의 직계 자식 (depth 1)
-   `position: absolute` + `top/left/width/height`로 배치
-   DnD 후에도 **같은 depth → React가 재사용 → 상태 유지**

---

## Drag & Drop 구현

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

### Tree 재구조화 (endDrag)

```typescript:src/actions/dnd-grid/store.ts
endDrag: () => {
    const { draggedItemId, hoveredItemId, dropQuadrant, tree } = get();

    if (tree && draggedItemId && hoveredItemId && dropQuadrant) {
        // 1. 변경 전 스냅샷 생성
        const snapshot = tree.createSnapshot();

        // 2. Tree 재구조화
        tree.restructureByDrop(draggedItemId, hoveredItemId, dropQuadrant);

        // 3. 변경된 Node만 추출 (React reconciliation 스타일)
        const changedIds = tree.diffWithSnapshot(snapshot);

        // 4. 변경된 Node만 복제하여 새로운 Map 생성
        const newNodes = cloneAffectedNodes(tree, changedIds);

        // 5. Zustand 상태 업데이트 → 리렌더 트리거
        set({ nodes: newNodes });
    }

    set({ draggedItemId: null, hoveredItemId: null, dropQuadrant: null });
}
```

### restructureByDrop: Tree 변경 알고리즘

```typescript:src/actions/dnd-grid/tree.ts
restructureByDrop(
    draggedItemId: number,
    hoveredItemId: number,
    dropQuadrant: DropQuadrant
) {
    const dragged = this.findNodeWithParent(draggedItemId);
    const hovered = this.findNodeWithParent(hoveredItemId);

    // Case 1: 같은 부모 공유 → 단순 Swap
    if (dragged.parent === hovered.parent) {
        this.swapSiblings(dragged.parent, dragged.node, dropQuadrant);
        this.calculateLayout(this._root);
        return;
    }

    // Case 2: 다른 부모 → 복잡한 재구조화

    // Step 1: 새 Split 생성
    const newSplit = new GridSplit(
        this.generateNewId(),  // maxId + 1
        getSplitDirection(dropQuadrant),
        0.5,
        dropQuadrant === 'top' || dropQuadrant === 'left'
            ? dragged.node
            : hovered.node,
        dropQuadrant === 'top' || dropQuadrant === 'left'
            ? hovered.node
            : dragged.node
    );

    // Step 2: hovered의 부모에 newSplit 연결
    if (hovered.parent.isPrimaryChildren(hovered.node.id)) {
        hovered.parent.primaryChild = newSplit;
    } else {
        hovered.parent.secondaryChild = newSplit;
    }

    // Step 3: dragged의 형제를 조부모에 승격
    const sibling = dragged.parent.isPrimaryChildren(dragged.node.id)
        ? dragged.parent.secondaryChild
        : dragged.parent.primaryChild;

    const grandParent = this.findNodeWithParent(dragged.parent.id)?.parent;

    if (!grandParent) {
        // dragged.parent가 root → sibling이 새 root
        this._root = sibling;
        sibling.width = this.root.width;
        sibling.height = this.root.height;
        sibling.top = 0;
        sibling.left = 0;
    } else {
        // 조부모에 sibling 연결
        if (grandParent.isPrimaryChildren(dragged.parent.id)) {
            grandParent.primaryChild = sibling;
        } else {
            grandParent.secondaryChild = sibling;
        }
    }

    // Step 4: 전체 레이아웃 재계산
    if (this._root.type === 'split') {
        this.calculateLayout(this._root);
    }
}
```

### 예시: Tree 변경 과정

**초기 구조:**

```
Split(1, horizontal, 0.5)
├── Item(2) ← dragged
└── Item(3)
```

**Item(2)를 Item(3)의 'right'에 드롭:**

```
Split(1, horizontal, 0.5)
├── Item(2)  ← 이동할 노드
└── Item(3)  ← 드롭 대상

→ 새 Split(4, vertical, 0.5) 생성

Split(1, horizontal, 0.5)
├── Item(2)  ← root가 됨 (형제 승격)
└── Split(4, vertical, 0.5)  ← 새 Split
    ├── Item(3)
    └── Item(2)  ← 이동 완료
```

**최종 구조:**

```
Item(2)  ← 새 root (dragged의 형제가 승격)

Split(4, vertical, 0.5)  ← hovered의 부모 위치에 삽입
├── Item(3)
└── Item(2)
```

**실제로는:**

```
Split(4, vertical, 0.5)  ← 새 root
├── Item(2)
└── Split(1, ...)
    └── Item(3)
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

# Trouble shooting

## 문제 상황

DnD Grid 컴포넌트에서 드래그 앤 드롭 후 **children 컴포넌트의 상태가 초기화**되는 문제가 발생했습니다.

```tsx
function AA() {
    const [count, setCount] = useState(0);
    return <div onClick={() => setCount((v) => v + 1)}>{count}</div>;
}

// DndGrid 사용
<DndGridContainer>
    <DndGridItem>
        <AA /> {/* DnD 후 count가 0으로 리셋됨 */}
    </DndGridItem>
</DndGridContainer>;
```

**증상:**

-   DnD 전: `<AA />` 컴포넌트를 클릭하여 count를 3까지 증가
-   DnD 실행: Item을 다른 위치로 드래그
-   DnD 후: count가 0으로 초기화 (상태 손실)

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
elementsCache: Map<number, React.ReactElement>;

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

-   ✅ 타입: `DndGridItem` (동일)
-   ✅ Key: `id=2` (동일)
-   ❌ **트리 위치: depth 2 → 3 (변경!)**

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

-   모든 Item이 **항상 같은 depth (Container의 직계 자식)**
-   DnD 후에도 트리 위치 변경 없음
-   React가 같은 컴포넌트로 인식 → 재사용 → **상태 유지**

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

-   **상태 보존:** DnD 후에도 `<AA />` 컴포넌트의 count 상태 유지
-   **React.memo 작동:** children 컴포넌트가 React.memo로 감싸져 있어도 정상 작동
-   **참조 유지:** 원본 React 엘리먼트 참조와 children 참조 모두 보존

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

-   Tree에서 각 Item의 `top`, `left`, `width`, `height` 계산
-   각 Item을 `position: absolute`로 배치
-   시각적으로는 동일한 레이아웃 유지

## 핵심 교훈

### 1. React Reconciliation 이해의 중요성

React는 다음을 모두 확인하여 컴포넌트 재사용 여부를 결정합니다:

-   컴포넌트 타입
-   key 값
-   **트리 위치 (depth)**

엘리먼트 참조나 children 참조를 보존하는 것만으로는 부족하며, **트리 구조 자체가 유지**되어야 합니다.

### 2. 논리적 구조 vs 렌더링 구조 분리

-   **논리적 구조:** Tree (Split과 Item의 계층 구조)
-   **렌더링 구조:** Flat (모든 Item을 같은 depth)

둘을 분리하여 논리적 구조로 레이아웃을 계산하되, 렌더링은 flat하게 수행함으로써 상태 보존과 올바른 레이아웃을 동시에 달성했습니다.

### 3. 상태 보존 전략

React 컴포넌트 상태를 보존하려면:

1. **key를 일관되게 유지**
2. **트리 위치를 변경하지 않음**
3. 엘리먼트 참조 보존 (cloneElement)
4. children 참조 보존 (캐싱)

단순히 참조만 보존하는 것이 아니라, React가 인식하는 **트리 구조를 일관되게 유지**하는 것이 핵심입니다.

---

## Next.js App Router 환경에서의 초기화 문제

### 문제 상황 (Next.js App Router)

Next.js App Router 환경에서 **첫 번째 DnD 실행 시** Item Content 컴포넌트 내부의 사용자 정의 컴포넌트 상태가 초기화되는 문제가 발생했습니다.

```tsx
// app/page.tsx
function UserComponent() {
    const [count, setCount] = useState(0);
    return <div onClick={() => setCount(v => v + 1)}>{count}</div>;
}

export default function Page() {
    return (
        <DndGridContainer width={800} height={600}>
            <DndGridItem>
                <UserComponent /> {/* 첫 DnD 후 count가 0으로 리셋 */}
            </DndGridItem>
        </DndGridContainer>
    );
}
```

**증상:**
- 첫 번째 DnD 전: `<UserComponent />`를 클릭하여 count를 5까지 증가
- 첫 번째 DnD 실행: Item을 다른 위치로 드래그
- DnD 후: count가 0으로 초기화 (이후 DnD에서는 정상 작동)

### 원인 분석

Next.js App Router는 기본적으로 모든 컴포넌트를 **Server Component**로 취급합니다. DndGrid는 다음과 같은 클라이언트 측 기능을 사용합니다:

1. **이벤트 핸들러** (`onMouseDown`, `onMouseMove`, `onMouseUp`)
2. **React Hooks** (`useState`, `useEffect`, `useCallback`)
3. **Zustand Store** (클라이언트 전역 상태)
4. **브라우저 API** (`MouseEvent`, DOM 조작)

#### Hydration Mismatch 발생

```
1. 서버에서 Server Component로 렌더링
   ↓
2. 클라이언트로 HTML 전송
   ↓
3. 클라이언트에서 React hydration 시도
   ↓
4. DnD 이벤트 발생 → Zustand store 업데이트
   ↓
5. 상태 불일치 감지 (서버 렌더링 결과 ≠ 클라이언트 상태)
   ↓
6. React가 안전을 위해 컴포넌트 리마운트
   ↓
7. 사용자 컴포넌트 상태 초기화 발생
```

#### 핵심 문제점

- **Server Component**는 서버에서 한 번 렌더링되고, 클라이언트에서 hydrate됨
- Zustand store는 **클라이언트 전용** 상태 관리 라이브러리
- 첫 DnD 시 서버 렌더링 결과와 클라이언트 상태 간 불일치 발생
- React가 hydration mismatch를 감지하고 컴포넌트를 재마운트
- 이후 DnD부터는 이미 클라이언트 상태로 완전히 전환되어 정상 작동

### 해결 방법

모든 DndGrid 관련 컴포넌트에 `"use client"` 지시문을 추가하여 **Client Component**로 명시합니다.

#### 수정한 컴포넌트

```typescript
// src/components/dnd-grid/container.tsx
"use client";

export function DndGridContainer({ children, width, height }: Props) {
    // ... 기존 코드
}
```

```typescript
// src/components/dnd-grid/split.tsx
"use client";

export function DndGridSplit({ children, direction, ratio }: Props) {
    // ... 기존 코드
}
```

```typescript
// src/components/dnd-grid/item.tsx
"use client";

export function DndGridItem({ children, id, top, left, width, height }: Props) {
    // ... 기존 코드
}
```

```typescript
// src/components/dnd-grid/item-content.tsx
"use client";

export function ItemContent({ id, children }: Props) {
    // ... 기존 코드
}
```

### "use client"가 필요한 이유

#### 1. 이벤트 핸들러 바인딩

```typescript
// Server Component에서는 작동하지 않음
<div onMouseDown={handleMouseDown}>
```

#### 2. React Hooks 사용

```typescript
// Server Component에서 불가능
const [draggedItemId, setDraggedItemId] = useState(null);
```

#### 3. Zustand Store 접근

```typescript
// 클라이언트 전용 전역 상태
const { tree, draggedItemId } = useTreeStore();
```

#### 4. 브라우저 API 사용

```typescript
// window, document 등은 서버에 존재하지 않음
const rect = element.getBoundingClientRect();
```

### 결과

#### ✅ 문제 해결

- **상태 보존:** 첫 번째 DnD 실행 시에도 사용자 컴포넌트 상태 유지
- **Hydration 안정화:** 서버-클라이언트 불일치 제거
- **일관된 동작:** 모든 DnD 동작이 동일하게 작동

#### 컴포넌트 렌더링 위치

```
Server Components (서버 렌더링)
└── app/page.tsx

Client Components (클라이언트 렌더링)
├── DndGridContainer ("use client")
├── DndGridSplit ("use client")
├── DndGridItem ("use client")
└── ItemContent ("use client")
    └── UserComponent (부모가 Client이므로 Client)
```

### 핵심 교훈

#### 1. Next.js App Router 환경 이해

- 기본값은 **Server Component**
- 상태, 이벤트, 브라우저 API 사용 시 **"use client" 필수**
- Client Component 내부의 모든 자식도 자동으로 Client Component

#### 2. Hydration Mismatch 주의

- 서버 렌더링 결과와 클라이언트 상태가 다르면 리마운트 발생
- 클라이언트 전용 라이브러리(Zustand)는 반드시 "use client" 필요
- 첫 상호작용에서만 문제가 발생하는 경우 hydration 의심

#### 3. DnD 라이브러리 설계 시 고려사항

- 모든 인터랙티브 컴포넌트는 Client Component로 설계
- 사용자에게 명확한 Next.js 사용 가이드 제공
- Server/Client 경계를 문서화

---

## 참고 자료

-   [React Reconciliation](https://react.dev/learn/preserving-and-resetting-state)
-   [React Keys](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)
-   [React.cloneElement](https://react.dev/reference/react/cloneElement)
-   [Zustand](https://github.com/pmndrs/zustand)
-   [Next.js Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
-   [Next.js "use client" Directive](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
