import { ComponentNode } from './util';

type ITEM = 'item';
type SPLIT = 'split';

export type NodeType = ITEM | SPLIT;
export type DndSplitDirection = 'horizontal' | 'vertical';

export type ChildNode = GridItem | GridSplit;
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

    get primary(): ChildNode {
        return this._primaryChild;
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
}

export class GridContainer {
    readonly type = 'container' as const;
    private _width: number;
    private _height: number;
    private _ratio: 1 = 1;
    private _top: 0 = 0;
    private _left: 0 = 0;
    private _child?: ChildNode;

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
    }

    // Getters
    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get ratio(): 1 {
        return this._ratio;
    }

    get top(): 0 {
        return this._top;
    }

    get left(): 0 {
        return this._left;
    }

    get child(): ChildNode | undefined {
        return this._child;
    }

    // Setters
    set width(value: number) {
        this._width = value;
    }

    set height(value: number) {
        this._height = value;
    }

    set child(value: ChildNode) {
        this._child = value;
    }
}

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
            return new GridItem(node.id);
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
}

export default Tree;
