import type {
    DndGridContainerType,
    DndGridItemType,
    DndGridSplitType,
    NodeType,
} from './type';

export class Tree {
    private _root: DndGridContainerType;

    constructor(props: Omit<DndGridContainerType, 'type'>) {
        this._root = {
            type: 'container',
            ...props,
        };
    }

    get root(): DndGridContainerType {
        return this._root;
    }

    set root(value: DndGridContainerType) {
        this._root = value;
    }
}

export class Node {
    private _type: NodeType | null = null;
    private _values: DndGridItemType | DndGridSplitType | null = null;

    constructor(type: NodeType, props: DndGridItemType | DndGridSplitType) {
        this._type = type;
        this._values = props;
    }

    get type(): NodeType | null {
        return this._type;
    }

    set type(value: NodeType | null) {
        this._type = value;
    }

    get values(): DndGridItemType | DndGridSplitType | null {
        return this._values;
    }

    set values(value: DndGridItemType | DndGridSplitType | null) {
        this._values = value;
    }
    setWidth(isPrimary: boolean, parentSplit: DndGridSplitType) {
        if (!this._values) return;

        if (isPrimary) {
            // primary - 부모 split가 수평: width(부모), 수직: ratio(부모)*width(부모)
            if (parentSplit.direction === 'horizontality') {
                this._values.width = parentSplit.width;
            } else {
                this._values.width = parentSplit.ratio * parentSplit.width;
            }
        } else {
            // secondary - 수평: width(부모), 수직: width(부모)-width(형제)
            if (parentSplit.direction === 'horizontality') {
                this._values.width = parentSplit.width;
            } else {
                this._values.width =
                    parentSplit.width - parentSplit.praimaryChild.width;
            }
        }
    }

    setHeight(isPrimary: boolean, parentSplit: DndGridSplitType) {
        if (!this._values) return;

        if (isPrimary) {
            // primary: 부모 split가 수평: ratio(부모)*height(부모), 수직: height(부모)
            if (parentSplit.direction === 'horizontality') {
                this._values.height = parentSplit.ratio * parentSplit.height;
            } else {
                this._values.height = parentSplit.height;
            }
        } else {
            // secondary - 수평: height(부모)-height(형제), 수직: height(부모)
            if (parentSplit.direction === 'horizontality') {
                this._values.height =
                    parentSplit.height - parentSplit.praimaryChild.height;
            } else {
                this._values.height = parentSplit.height;
            }
        }
    }

    setTop(isPrimary: boolean, parentSplit: DndGridSplitType) {
        if (!this._values) return;

        if (isPrimary) {
            // primary: 부모 split의 수평: top(부모), 수직: top(부모)
            this._values.top = parentSplit.top;
        } else {
            // secondary - 수평: top(부모)+height(형제), 수직: top(부모)
            if (parentSplit.direction === 'horizontality') {
                this._values.top =
                    parentSplit.top + parentSplit.praimaryChild.height;
            } else {
                this._values.top = parentSplit.top;
            }
        }
    }

    setLeft(isPrimary: boolean, parentSplit: DndGridSplitType) {
        if (!this._values) return;

        if (isPrimary) {
            // primary: 부모 split의 수평: left(부모), 수직: left(부모)
            this._values.left = parentSplit.left;
        } else {
            // secondary - 수평: left(부모), 수직: left(부모)+width(형제)
            if (parentSplit.direction === 'horizontality') {
                this._values.left = parentSplit.left;
            } else {
                this._values.left =
                    parentSplit.left + parentSplit.praimaryChild.width;
            }
        }
    }
}

export default Tree;
