// 최상위 루트는 컨테이너

type CONTAINER = 'container';
type ITEM = 'item';
type SPLIT = 'split';

type DndNodeType = CONTAINER | ITEM | SPLIT;

type DndSplitDirection = 'horizontality' | 'verticality';

interface DndGridContainerType {
    type: CONTAINER;
    width: number;
    height: number;
}
interface DndGridItemType {
    type: ITEM;
    top: number;
    left: number;

    width: number;
    height: number;
}

interface DndGridSplitType {
    type: SPLIT;
    direction: DndSplitDirection;
}
