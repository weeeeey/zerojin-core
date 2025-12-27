import type {
    DndGridContainerType,
    DndGridItemType,
    DndGridSplitType,
    NodeType,
} from './type';

export class Tree {
    root: DndGridContainerType;
    constructor(props: Omit<DndGridContainerType, 'type'>) {
        this.root = {
            type: 'container',
            ...props,
        };
    }
}

export class Node {
    type: NodeType | null = null;
    values: DndGridItemType | DndGridSplitType | null = null;
    constructor(type: NodeType, props: DndGridItemType | DndGridSplitType) {
        this.type = type;
        this.values = props;
    }
    setWidth(isPrimary: boolean, parentSplit: DndGridSplitType) {
        if (!this.values) return;

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
                    parentSplit.width - parentSplit.praimaryChild.width;
            }
        }
    }

    setHeight(isPrimary: boolean, parentSplit: DndGridSplitType) {
        if (!this.values) return;

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
                    parentSplit.height - parentSplit.praimaryChild.height;
            } else {
                this.values.height = parentSplit.height;
            }
        }
    }

    setTop(isPrimary: boolean, parentSplit: DndGridSplitType) {
        if (!this.values) return;

        if (isPrimary) {
            // primary: 부모 split의 수평: top(부모), 수직: top(부모)
            this.values.top = parentSplit.top;
        } else {
            // secondary - 수평: top(부모)+height(형제), 수직: top(부모)
            if (parentSplit.direction === 'horizontality') {
                this.values.top =
                    parentSplit.top + parentSplit.praimaryChild.height;
            } else {
                this.values.top = parentSplit.top;
            }
        }
    }

    setLeft(isPrimary: boolean, parentSplit: DndGridSplitType) {
        if (!this.values) return;

        if (isPrimary) {
            // primary: 부모 split의 수평: left(부모), 수직: left(부모)
            this.values.left = parentSplit.left;
        } else {
            // secondary - 수평: left(부모), 수직: left(부모)+width(형제)
            if (parentSplit.direction === 'horizontality') {
                this.values.left = parentSplit.left;
            } else {
                this.values.left =
                    parentSplit.left + parentSplit.praimaryChild.width;
            }
        }
    }
}

export default Tree;
