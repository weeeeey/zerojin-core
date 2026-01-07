import { ComponentNode, DropQuadrant, NodeType, DndSplitDirection, NodeSnapshot } from './types';
import { getSplitDirection } from './util';
import React from 'react';

export type ChildNode = GridItem | GridSplit;

type ParentWithCurrent = { node: ChildNode; parent: GridSplit | null };


/**
 * 노드를 복제하여 새로운 객체 참조를 생성합니다.
 * Zustand가 변경을 감지할 수 있도록 새 객체를 반환합니다.
 */
export function cloneNode(node: ChildNode): ChildNode {
    if (node.type === 'item') {
        const cloned = new GridItem(node.id, node.children);
        cloned.width = node.width;
        cloned.height = node.height;
        cloned.top = node.top;
        cloned.left = node.left;
        return cloned;
    } else {
        // Split 노드는 자식 참조를 유지 (나중에 선택적으로 교체됨)
        const cloned = new GridSplit(
            node.id,
            node.direction,
            node.ratio,
            node.primaryChild,
            node.secondaryChild
        );
        cloned.width = node.width;
        cloned.height = node.height;
        cloned.top = node.top;
        cloned.left = node.left;
        return cloned;
    }
}
// Base Node class for common properties and methods
abstract class BaseNode {
    private _id: number;
    private _width = 0;
    private _height = 0;
    private _top = 0;
    private _left = 0;

    constructor(id: number) {
        this._id = id;
    }

    // Getters
    get id(): number {
        return this._id;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get top(): number {
        return this._top;
    }

    get left(): number {
        return this._left;
    }

    // Setters
    set width(value: number) {
        this._width = value;
    }

    set height(value: number) {
        this._height = value;
    }

    set top(value: number) {
        this._top = value;
    }

    set left(value: number) {
        this._left = value;
    }

    abstract get type(): NodeType;

    setWidth(parentSplit: GridSplit): void {
        const isPrimary = parentSplit.primaryChild.id === this.id;

        if (isPrimary) {
            // primary - 부모 split가 수평: width(부모), 수직: ratio(부모)*width(부모)
            if (parentSplit.direction === 'horizontal') {
                this.width = parentSplit.width;
            } else {
                this.width = parentSplit.ratio * parentSplit.width;
            }
        } else {
            // secondary - 수평: width(부모), 수직: width(부모)-width(형제)
            if (parentSplit.direction === 'horizontal') {
                this.width = parentSplit.width;
            } else {
                this.width = parentSplit.width - parentSplit.primaryChild.width;
            }
        }
    }

    setHeight(parentSplit: GridSplit): void {
        const isPrimary = parentSplit.primaryChild.id === this.id;

        if (isPrimary) {
            // primary: 부모 split가 수평: ratio(부모)*height(부모), 수직: height(부모)
            if (parentSplit.direction === 'horizontal') {
                this.height = parentSplit.ratio * parentSplit.height;
            } else {
                this.height = parentSplit.height;
            }
        } else {
            // secondary - 수평: height(부모)-height(형제), 수직: height(부모)
            if (parentSplit.direction === 'horizontal') {
                this.height =
                    parentSplit.height - parentSplit.primaryChild.height;
            } else {
                this.height = parentSplit.height;
            }
        }
    }

    setTop(parentSplit: GridSplit): void {
        const isPrimary = parentSplit.primaryChild.id === this.id;

        if (isPrimary) {
            // primary: 부모 split의 수평: top(부모), 수직: top(부모)
            this.top = parentSplit.top;
        } else {
            // secondary - 수평: top(부모)+height(형제), 수직: top(부모)
            if (parentSplit.direction === 'horizontal') {
                this.top = parentSplit.top + parentSplit.primaryChild.height;
            } else {
                this.top = parentSplit.top;
            }
        }
    }

    setLeft(parentSplit: GridSplit): void {
        const isPrimary = parentSplit.primaryChild.id === this.id;

        if (isPrimary) {
            // primary: 부모 split의 수평: left(부모), 수직: left(부모)
            this.left = parentSplit.left;
        } else {
            // secondary - 수평: left(부모), 수직: left(부모)+width(형제)
            if (parentSplit.direction === 'horizontal') {
                this.left = parentSplit.left;
            } else {
                this.left = parentSplit.left + parentSplit.primaryChild.width;
            }
        }
    }

    private setPosition(parentSplit: GridSplit): void {
        this.setTop(parentSplit);
        this.setLeft(parentSplit);
    }

    private setSize(parentSplit: GridSplit): void {
        this.setWidth(parentSplit);
        this.setHeight(parentSplit);
    }

    applyLayout(parentSplit: GridSplit): void {
        this.setPosition(parentSplit);
        this.setSize(parentSplit);
    }
}

// 렌더링 될 컴포넌트(그리드 아이템)
export class GridItem extends BaseNode {
    readonly type = 'item' as const;
    readonly children: React.ReactNode;

    constructor(id: number, children?: React.ReactNode) {
        super(id);
        this.children = children;
    }
}

// 컴포넌트를 분할 할 보이지 않는 선
export class GridSplit extends BaseNode {
    readonly type = 'split' as const;
    private _direction: DndSplitDirection;
    private _ratio: number;
    private _primaryChild: ChildNode;
    private _secondaryChild: ChildNode;

    constructor(
        id: number,
        direction: DndSplitDirection,
        ratio: number,
        primaryChild: ChildNode,
        secondaryChild: ChildNode
    ) {
        super(id);
        this._direction = direction;
        this._ratio = ratio;
        this._primaryChild = primaryChild;
        this._secondaryChild = secondaryChild;
    }

    // Getters
    get direction(): DndSplitDirection {
        return this._direction;
    }

    get ratio(): number {
        return this._ratio;
    }

    get primaryChild(): ChildNode {
        return this._primaryChild;
    }

    get secondaryChild(): ChildNode {
        return this._secondaryChild;
    }

    // Setters
    set direction(value: DndSplitDirection) {
        this._direction = value;
    }

    set ratio(value: number) {
        this._ratio = value;
    }

    set primaryChild(value: ChildNode) {
        this._primaryChild = value;
    }

    set secondaryChild(value: ChildNode) {
        this._secondaryChild = value;
    }

    isPrimaryChildren(targetId: number): boolean {
        if (targetId === this.primaryChild.id) return true;
        return false;
    }
}

// export class GridContainer {
//     readonly type = 'container' as const;
//     private _width: number;
//     private _height: number;
//     private _ratio: 1 = 1;
//     private _top: 0 = 0;
//     private _left: 0 = 0;
//     private _child?: ChildNode;

//     constructor(width: number, height: number) {
//         this._width = width;
//         this._height = height;
//     }

//     // Getters
//     get width(): number {
//         return this._width;
//     }

//     get height(): number {
//         return this._height;
//     }

//     get ratio(): 1 {
//         return this._ratio;
//     }

//     get top(): 0 {
//         return this._top;
//     }

//     get left(): 0 {
//         return this._left;
//     }

//     get child(): ChildNode | undefined {
//         return this._child;
//     }

//     // Setters
//     set width(value: number) {
//         this._width = value;
//     }

//     set height(value: number) {
//         this._height = value;
//     }

//     set child(value: ChildNode) {
//         this._child = value;
//     }
// }

export class Tree {
    private _root: ChildNode;

    constructor(
        containerWidth: number,
        containerHeight: number,
        componentsRootNode: ComponentNode
    ) {
        // 1단계: 트리 구조만 생성
        this._root = this.buildFromComponentNode(componentsRootNode);

        // 2단계: 루트 노드에 컨테이너 크기 직접 적용
        this._root.width = containerWidth;
        this._root.height = containerHeight;
        this._root.top = 0;
        this._root.left = 0;

        // 3단계: 재귀적으로 자식들 레이아웃 계산
        if (this._root.type === 'split') {
            this.calculateLayout(this._root);
        } else {
            this._root.width = containerWidth;
            this._root.height = containerHeight;
        }
    }

    get root(): ChildNode {
        return this._root;
    }

    set root(value: ChildNode) {
        this._root = value;
    }

    private buildFromComponentNode(node: ComponentNode): ChildNode {
        if (node.type === 'item') {
            return new GridItem(node.id, node.children);
        } else {
            // 재귀적으로 자식들도 변환
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
    }

    private calculateLayout(parent: GridSplit): void {
        // 자식들에게 부모 기반으로 레이아웃 적용
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

    private getMaxId(node: ChildNode): number {
        if (node.type === 'item') {
            return node.id;
        }
        const primaryMax = this.getMaxId(node.primaryChild);
        const secondaryMax = this.getMaxId(node.secondaryChild);
        return Math.max(node.id, primaryMax, secondaryMax);
    }

    private generateNewId(): number {
        return this.getMaxId(this._root) + 1;
    }

    private generateNewSplitNode(
        dragged: ChildNode,
        hovered: ChildNode,
        dropQuadrant: DropQuadrant
    ) {
        const directon = getSplitDirection(dropQuadrant);
        let primary = dragged;
        let secondary = hovered;
        if (dropQuadrant === 'bottom' || dropQuadrant === 'right') {
            [primary, secondary] = [secondary, primary];
        }

        return new GridSplit(
            this.generateNewId(),
            directon,
            0.5,
            primary,
            secondary
        );
    }

    private findNodeWithParent(
        targetId: number,
        current: ChildNode = this._root,
        parent: GridSplit | null = null
    ): ParentWithCurrent | null {
        if (current.id === targetId) {
            return { node: current, parent };
        }

        if (current.type === 'split') {
            const foundInPrimary = this.findNodeWithParent(
                targetId,
                current.primaryChild,
                current
            );
            if (foundInPrimary) return foundInPrimary;

            const foundInSecondary = this.findNodeWithParent(
                targetId,
                current.secondaryChild,
                current
            );
            if (foundInSecondary) return foundInSecondary;
        }

        return null;
    }

    /**
     * 같은 부모를 공유하는 두 노드의 위치를 교환합니다.
     */
    private swapSiblings(
        parent: GridSplit,
        dragged: GridItem,
        dropQuadrant: DropQuadrant
    ): void {
        const isDraggedPrimary = parent.primaryChild.id === dragged.id;
        const direction = getSplitDirection(dropQuadrant);
        // dropQuadrant가 left/top이고 dragged가 primary면 스왑 불필요
        parent.direction = direction;
        if (
            (dropQuadrant === 'left' || dropQuadrant === 'top') &&
            isDraggedPrimary
        ) {
            return;
        }

        // dropQuadrant가 right/bottom이고 dragged가 secondary면 스왑 불필요
        if (
            (dropQuadrant === 'right' || dropQuadrant === 'bottom') &&
            !isDraggedPrimary
        ) {
            return;
        }

        [parent.primaryChild, parent.secondaryChild] = [
            parent.secondaryChild,
            parent.primaryChild,
        ];
    }

    /**
     *
     * @param draggedItemId
     * @param hoveredItemId
     * @param dropQuadrant
     *
     * hoverItemId(hi)의 Parent Split -> hS
     * draggedItemId(di)의 parent Split -> ds , * ds의 parent Split -> dds ,
     *
     * 1. hi가 hs의 primary인지 secondary인지 구하기
     * 2. 새로운 split 노드를 생성한다. (ns)
     *  2-0 id는 어떻게 할지 고민 중
     *  2-1. ratio 0.5
     *  2-2. dropQuadrant가 top|bottom horizon, left|right vertical 생성
     *  2-3. left 또는 top이라면 ns의 primary는 di secondary는 hi, right 또는 bottom이라면 반대
     * 3. 1번에서 구한 primary 또는 secondary에 ns를 등록해준다.
     * 4. ds의 자식 중 di가 아닌 item을 dds의 primary 또는 secondary 중 ds 에 해당하는 자리에 넣어준다.
     * 5. 변경 된 트리의 루트부터 요소들의 레이아웃을 재계산해준다.
     */

    /**
     * 트리의 현재 상태를 스냅샷으로 저장합니다.
     * 나중에 diffTree로 비교할 수 있도록 shallow copy를 만듭니다.
     */
    createSnapshot(): Map<number, NodeSnapshot> {
        const snapshot = new Map<number, NodeSnapshot>();

        const traverse = (node: ChildNode) => {
            const data: NodeSnapshot = {
                id: node.id,
                width: node.width,
                height: node.height,
                top: node.top,
                left: node.left,
            };

            if (node.type === 'split') {
                data.primaryChildId = node.primaryChild.id;
                data.secondaryChildId = node.secondaryChild.id;
            }

            snapshot.set(node.id, data);

            if (node.type === 'split') {
                traverse(node.primaryChild);
                traverse(node.secondaryChild);
            }
        };

        traverse(this._root);
        return snapshot;
    }

    /**
     * 스냅샷과 현재 트리를 비교하여 변경된 노드만 찾습니다.
     * React reconciliation 알고리즘처럼 동작합니다.
     */
    diffWithSnapshot(snapshot: Map<number, NodeSnapshot>): Set<number> {
        const changedIds = new Set<number>();

        const traverse = (node: ChildNode) => {
            const oldData = snapshot.get(node.id);

            // 새로 추가된 노드
            if (!oldData) {
                this.collectAllDescendants(node, changedIds);
                return;
            }

            // 레이아웃 속성 변경 체크
            const layoutChanged =
                oldData.width !== node.width ||
                oldData.height !== node.height ||
                oldData.top !== node.top ||
                oldData.left !== node.left;

            if (layoutChanged) {
                changedIds.add(node.id);
            }

            // Split 노드의 구조 변경 체크
            if (node.type === 'split') {
                const structureChanged =
                    oldData.primaryChildId !== node.primaryChild.id ||
                    oldData.secondaryChildId !== node.secondaryChild.id;

                if (structureChanged) {
                    // 구조가 변경되면 이 노드와 모든 자손 영향받음
                    changedIds.add(node.id);
                    this.collectAllDescendants(node.primaryChild, changedIds);
                    this.collectAllDescendants(node.secondaryChild, changedIds);
                } else {
                    // 구조가 같으면 자식들 재귀 탐색
                    traverse(node.primaryChild);
                    traverse(node.secondaryChild);
                }
            }
        };

        traverse(this._root);
        return changedIds;
    }

    /**
     * 주어진 노드의 모든 자손 ID를 Set에 추가합니다.
     */
    private collectAllDescendants(node: ChildNode, ids: Set<number>): void {
        ids.add(node.id);
        if (node.type === 'split') {
            this.collectAllDescendants(node.primaryChild, ids);
            this.collectAllDescendants(node.secondaryChild, ids);
        }
    }

    restructureByDrop(
        draggedItemId: number,
        hoveredItemId: number,
        dropQuadrant: DropQuadrant
    ) {
        const dragged = this.findNodeWithParent(draggedItemId);
        const hovered = this.findNodeWithParent(hoveredItemId);
        if (!dragged || !hovered || !dragged.parent || !hovered.parent) {
            throw Error('Invalid drag/drop state');
        }

        // 같은 부모를 공유하는 경우: 위치만 교환
        if (dragged.parent === hovered.parent) {
            this.swapSiblings(
                dragged.parent,
                dragged.node as GridItem,
                dropQuadrant
            );

            if (this._root.type === 'split') {
                this.calculateLayout(this._root);
            }
            return;
        }

        // 2단계: 새 Split 생성
        const newSplitNode = this.generateNewSplitNode(
            dragged.node,
            hovered.node,
            dropQuadrant
        );

        // 3단계: hovered 부모에 새 Split 연결
        if (hovered.parent.isPrimaryChildren(hovered.node.id)) {
            hovered.parent.primaryChild = newSplitNode;
        } else {
            hovered.parent.secondaryChild = newSplitNode;
        }

        // 4단계: dragged 형제 승격
        const { parent: draggedGrandParent } = this.findNodeWithParent(
            dragged.parent.id
        )!;
        // grandParent가 루트인 경우

        const siblingDragNode = dragged.parent.isPrimaryChildren(
            dragged.node.id
        )
            ? dragged.parent.secondaryChild
            : dragged.parent.primaryChild;

        if (!draggedGrandParent) {
            siblingDragNode.width = this.root.width;
            siblingDragNode.height = this.root.height;
            siblingDragNode.top = 0;
            siblingDragNode.left = 0;

            this._root = siblingDragNode;

            // this.root = newSplitNode;
        } else {
            if (draggedGrandParent?.isPrimaryChildren(dragged.parent.id)) {
                draggedGrandParent.primaryChild = siblingDragNode;
            } else {
                draggedGrandParent!.secondaryChild = siblingDragNode;
            }
        }

        // 5단계: 레이아웃 재계산
        if (this._root.type === 'split') {
            this.calculateLayout(this._root);
        }
    }
}

export default Tree;
