type ITEM = 'item';
type SPLIT = 'split';

export type NodeType = ITEM | SPLIT;
export type DndSplitDirection = 'horizontality' | 'verticality';

type ChildNode = GridItem | GridSplit;
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
            if (parentSplit.direction === 'horizontality') {
                this.width = parentSplit.width;
            } else {
                this.width = parentSplit.ratio * parentSplit.width;
            }
        } else {
            // secondary - 수평: width(부모), 수직: width(부모)-width(형제)
            if (parentSplit.direction === 'horizontality') {
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
            if (parentSplit.direction === 'horizontality') {
                this.height = parentSplit.ratio * parentSplit.height;
            } else {
                this.height = parentSplit.height;
            }
        } else {
            // secondary - 수평: height(부모)-height(형제), 수직: height(부모)
            if (parentSplit.direction === 'horizontality') {
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
            if (parentSplit.direction === 'horizontality') {
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
            if (parentSplit.direction === 'horizontality') {
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

    // constructor(
    //     id: number,
    //     width: number,
    //     height: number,
    //     top: number,
    //     left: number
    // ) {
    //     super(id);
    // }
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
    private _root: GridContainer;

    constructor(width: number, height: number, node: ChildNode) {
        this._root = new GridContainer(width, height);
        this._root.child = node;
    }

    get root(): GridContainer {
        return this._root;
    }

    set root(value: GridContainer) {
        this._root = value;
    }

    buildTree(nodes: ChildNode[]): void {
        if (nodes.length < 1) return;

        const dfs = (currentIdx: number) => {
            const curNode = nodes[currentIdx];
            if (curNode.type === 'item') {
                return;
            }
            const nextPrimary = currentIdx * 2;
            const nextSecondary = nextPrimary + 1;
        };
        dfs(1);
    }
    calculate(): void {
        const bfs = (cur: ChildNode, parent: GridSplit) => {
            if (cur.type === 'item') {
                cur.applyLayout(parent);
                return;
            } else {
                bfs(cur.primaryChild, cur);
                bfs(cur.secondaryChild, cur);
            }
        };

        if (this._root.child) {
            // bfs(this._root.child, this._root);
        }
    }
}

export default Tree;
