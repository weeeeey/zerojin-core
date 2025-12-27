import type {
    DndGridContainerType,
    DndGridItemType,
    DndGridNodeType,
    DndGridSplitType,
} from './type';

type ChildNode = GridItem | GridSplit;
type RootType = DndGridContainerType & {
    child?: ChildNode;
};
export class Tree {
    root: RootType;

    constructor(props: Omit<DndGridContainerType, 'type'>) {
        this.root = {
            type: 'container',

            ...props,
        };
    }
    push(node: ChildNode) {
        this.root.child = node;
    }
    calculate() {
        const bfs = (cur: ChildNode, parent: ChildNode | RootType) => {
            let isPrimary = true;
            // if (parent.type !== 'container') {
            //     isPrimary = false;
            // }

            // if (cur.type === 'item') {
            // } else {
            // }
        };
        if (this.root.child) {
            bfs(this.root.child, this.root);
        }
    }
}

class Node<T extends DndGridNodeType> {
    values: T;
    constructor(values: T) {
        this.values = values;
    }
    setWidth(parentSplit: DndGridSplitType) {
        if (!this.values) return;
        const isPrimary = parentSplit.primaryChild.id === this.values.id;
        if (isPrimary) {
            // primary - 부모 split가 수평: width(부모), 수직: ratio(부모)*width(부모)
            if (parentSplit.direction === 'horizontality') {
                this.values.width = parentSplit.width;
            } else {
                this.values.width = parentSplit.ratio * parentSplit.width;
            }
        } else {
            // secondary - 수평: width(부모), 수직: width(부모)-width(형제)
            if (parentSplit.direction === 'horizontality') {
                this.values.width = parentSplit.width;
            } else {
                this.values.width =
                    parentSplit.width - parentSplit.primaryChild.width;
            }
        }
    }

    setHeight(parentSplit: DndGridSplitType) {
        if (!this.values) return;
        const isPrimary = parentSplit.primaryChild.id === this.values.id;
        if (isPrimary) {
            // primary: 부모 split가 수평: ratio(부모)*height(부모), 수직: height(부모)
            if (parentSplit.direction === 'horizontality') {
                this.values.height = parentSplit.ratio * parentSplit.height;
            } else {
                this.values.height = parentSplit.height;
            }
        } else {
            // secondary - 수평: height(부모)-height(형제), 수직: height(부모)
            if (parentSplit.direction === 'horizontality') {
                this.values.height =
                    parentSplit.height - parentSplit.primaryChild.height;
            } else {
                this.values.height = parentSplit.height;
            }
        }
    }

    setTop(parentSplit: DndGridSplitType) {
        if (!this.values) return;
        const isPrimary = parentSplit.primaryChild.id === this.values.id;
        if (isPrimary) {
            // primary: 부모 split의 수평: top(부모), 수직: top(부모)
            this.values.top = parentSplit.top;
        } else {
            // secondary - 수평: top(부모)+height(형제), 수직: top(부모)
            if (parentSplit.direction === 'horizontality') {
                this.values.top =
                    parentSplit.top + parentSplit.primaryChild.height;
            } else {
                this.values.top = parentSplit.top;
            }
        }
    }

    setLeft(parentSplit: DndGridSplitType) {
        if (!this.values) return;
        const isPrimary = parentSplit.primaryChild.id === this.values.id;
        if (isPrimary) {
            // primary: 부모 split의 수평: left(부모), 수직: left(부모)
            this.values.left = parentSplit.left;
        } else {
            // secondary - 수평: left(부모), 수직: left(부모)+width(형제)
            if (parentSplit.direction === 'horizontality') {
                this.values.left = parentSplit.left;
            } else {
                this.values.left =
                    parentSplit.left + parentSplit.primaryChild.width;
            }
        }
    }
    private setPosition(parentSplit: DndGridSplitType) {
        this.setTop(parentSplit);
        this.setLeft(parentSplit);
    }

    private setSize(parentSplit: DndGridSplitType) {
        this.setWidth(parentSplit);
        this.setHeight(parentSplit);
    }

    applyLayout(parentSplit: DndGridSplitType) {
        this.setPosition(parentSplit);
        this.setSize(parentSplit);
    }
}

class GridItem extends Node<DndGridItemType> {
    readonly type = 'item' as const;

    constructor(values: DndGridItemType) {
        super(values);
    }
}
class GridSplit extends Node<DndGridSplitType> {
    readonly type = 'split' as const;

    constructor(values: DndGridSplitType) {
        super(values);
    }

    get primary() {
        return this.values.primaryChild;
    }
}

export default Tree;
