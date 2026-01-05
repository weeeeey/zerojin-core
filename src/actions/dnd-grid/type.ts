// 최상위 루트는 컨테이너

type CONTAINER = 'container';
type ITEM = 'item';
type SPLIT = 'split';
export type NodeType = ITEM | SPLIT;
export type DndSplitDirection = 'horizontality' | 'verticality';

/**
 * [tree의 규칙]
 * -container는 tree의 root를 뜻한다. 
 * -item은 컴포넌트, split은 분할선을 의미한다.

 * -root는 전체 width와 height을 받는다.
 * -root의 자식은 오로지 한개만 존재한다. 이때 자식은 item 또는 split 이다.
 * -root는 relative로 상대 좌표들의 기준점이 된다.
 *  
 * -split의 자식으로는 split 또는 item이 된다.
 * -split의 자식은 무조건 2개이어야 한다. (primaryPane - secondaryPane)
 *    - split           horizon / vertical
 *    - primaryPane -     up    /   left
 *    - secondaryPane  - down   /   right 
 * -split은 두개의 자식을 가르는 분할선을 의미한다. 수직/수평을 의미하는 direction이 존재한다. (컴포넌트의 props로 left-right | up-down 같은 쌍으로 받아오기)
 * -split은 left right의 비율을 정하는 ratio가 있다. (ratio는 0과 1사이의 숫자인 비율을 의마한다.)
 * 
 *
 * -item은 자식을 가질 수 없다.
 * -모든 리프 노드는 item 이어야 한다.
 * -item은 컴포넌트의 위치를 가르키는 top과 left가 존재한다. 
 * -item의 폭과 높이 값은 root인 
 * 
 * [tree의 동작]
 * -초기화(트리 구성 - 초기 렌더링), 업데이트(dnd 작업 - 리렌더링), 삽입 삭제 (버튼으로 조작 - 리렌더링)
 * 
 * [초기화]
 * -초기 렌더링 이전 트리 구성
 * -root 생성 
 * -split의 자식인 
 */

export interface DndGridContainerType {
    type: CONTAINER;

    width: number;
    height: number;

    radio: 1;
    top: 0;
    left: 0;
}

interface DefaultType {
    id: number;
    width: number;
    // primary - 부모 split가 수평: width(부모), 수직: radio(부모)*width(부모),
    // secondary -          수평: width(부모), 수직: width(부모)-width(형제)
    height: number;
    // primary: 부모 split가 수평: radio(부모)*height(부모), 수직: height(부모),
    // secondary -         수평: height(부모)-height(형제), 수직: height(부모),

    top: number;
    // primary: 부모 split의 수평: top(부모) ,            수직:top(부모)
    // secondary -         수평: top(부모)+height(형제),  수직:top(부모)
    left: number;
    // primary: 부모 split의 수평: left(부모) , 수직:left(부모)
    // secondary -         수평: left(부모),  수직:left(부모)+width(형제)
}

export type DndGridNodeType = DndGridItemType | DndGridSplitType;

export interface DndGridItemType extends DefaultType {}

export interface DndGridSplitType extends DefaultType {
    direction: DndSplitDirection; // 분할 할려는 수직 또는 수평을 지정해줘야 한다.

    ratio: number; // 0과 1사이의 숫자 (비율이 와야한다)

    primaryChild: DndGridNodeType;
    secondaryChild: DndGridNodeType;
}
