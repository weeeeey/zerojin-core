// 최상위 루트는 컨테이너

type CONTAINER = 'container';
type ITEM = 'item';
type SPLIT = 'split';

type DndNodeType = ITEM | SPLIT;

type DndSplitDirection = 'horizontality' | 'verticality';

/**
 * [tree의 규칙]
 * -container는 tree의 root를 뜻한다. 
 * -item은 컴포넌트, split은 분할선을 의미한다.

 * -root는 전체 width와 height을 받는다.
 * -root의 자식은 오로지 한개만 존재한다. 이때 자식은 item 또는 split 이다.
 * -root는 relative로 상대 좌표들의 기준점이 된다.
 *  
 * -split의 자식으로는 split 또는 item이 된다.
 * -split의 자식은 무조건 2개이어야 한다.
 * -split은 두개의 자식을 가르는 분할선을 의미한다. 수직/수평을 의미하는 direction이 존재한다.
 * -split은 left right의 비율을 정하는 ratio가 있다. (ratio는 0과 1사이의 숫자인 비율이다.)
 *
 * -item은 자식을 가질 수 없다.
 * -모든 리프 노드는 item 이어야 한다.
 * -item은 relative한 속성을 가진 컴포넌트이다.
 * -item은 컴포넌트의 위치를 가르키는 top과 left가 존재한다. 
 * -item의 폭과 높이 값은 root인 
 * 
 */

interface DndGridContainerType {
    type: ITEM | SPLIT;
    width: number;
    height: number;
    className?: string;
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
    direction: DndSplitDirection; // 분할 할려는 수직 또는 수평을 지정해줘야 한다.
    ratio: number; // 0과 1사이의 숫자 (비율이 와야한다)
    childrenType: SPLIT | ITEM;
}
