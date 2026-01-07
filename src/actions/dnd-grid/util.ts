import React from 'react';
import { ChildNode, DndSplitDirection } from './tree';
import { useTreeStore } from './store';

export interface ComponentNode {
    type: 'split' | 'item';
    id: number;

    // Split 컴포넌트인 경우
    direction?: 'horizontal' | 'vertical';
    ratio?: number;
    primary?: ComponentNode;
    secondary?: ComponentNode;

    // Item 컴포넌트인 경우
    children?: React.ReactNode;
}

interface ParseChildrenOptions {
    DndGridSplit: React.ComponentType<any>;
    DndGridItem: React.ComponentType<any>;
    ItemDrag?: React.ComponentType<any>;
}

/**
 * React children을 재귀적으로 파싱하여 ComponentNode 트리 구조로 변환 (이진 트리 ID 체계 사용)
 * @param node - 파싱할 React 노드
 * @param options - 컴포넌트 타입 판별을 위한 옵션
 * @param parentId - 부모 노드의 ID (기본값: 0은 root를 의미)
 * @returns ComponentNode 또는 null
 */
export function parseChildren(
    node: React.ReactNode,
    options: ParseChildrenOptions,
    parentId: number = 0
): ComponentNode | null {
    const { DndGridSplit } = options;

    if (!React.isValidElement(node)) {
        return null;
    }

    // 이진 트리 인덱싱: root의 첫 자식은 1, 이후 primary = parentId * 2, secondary = parentId * 2 + 1
    const nodeId = parentId === 0 ? 1 : parentId;

    // DndGridSplit 컴포넌트인 경우
    if (node.type === DndGridSplit) {
        const props = node.props as {
            direction: 'horizontal' | 'vertical';
            ratio: number;
            children: [React.ReactNode, React.ReactNode];
        };

        const childrenArray = React.Children.toArray(props.children);

        if (childrenArray.length !== 2) {
            console.warn(
                `DndGridSplit expects exactly 2 children, got ${childrenArray.length}`
            );
            return null;
        }

        const primary = parseChildren(childrenArray[0], options, nodeId * 2);
        const secondary = parseChildren(
            childrenArray[1],
            options,
            nodeId * 2 + 1
        );

        if (!primary || !secondary) {
            console.warn('Failed to parse Split children');
            return null;
        }

        // 원본 Split 엘리먼트를 캐시에 저장
        const saveElementToCache = useTreeStore.getState().saveElementToCache;
        saveElementToCache(nodeId, node);

        return {
            type: 'split',
            id: nodeId,
            direction: props.direction,
            ratio: +props.ratio.toFixed(2),
            primary,
            secondary,
        };
    }

    // DndGridItem 컴포넌트인 경우
    const props = node.props as { children?: React.ReactNode };

    // 원본 Item 엘리먼트와 children을 캐시에 저장
    const saveChildrenToCache = useTreeStore.getState().saveChildrenToCache;
    const saveElementToCache = useTreeStore.getState().saveElementToCache;

    saveElementToCache(nodeId, node);
    if (props.children) {
        saveChildrenToCache(nodeId, props.children);
    }

    return {
        type: 'item',
        id: nodeId,
        children: props.children,
    };
    // if (node.type === DndGridItem) {
    // }

    // // 알 수 없는 컴포넌트
    // console.warn('Unknown component type:', node.type);
    // return null;
}

/**
 * Tree에서 계산된 ID를 React children에 주입
 * @param reactNode - React 노드
 * @param treeNode - 계산된 ID를 가진 Tree 노드
 * @param options - 컴포넌트 타입 판별을 위한 옵션
 * @returns ID props가 주입된 React 노드
 */
// export function injectLayoutToChildren(
//     reactNode: React.ReactNode,
//     treeNode: any, // ChildNode 타입 (GridItem | GridSplit)
//     options: ParseChildrenOptions
// ): React.ReactNode {
//     const { DndGridSplit, DndGridItem } = options;

//     if (!React.isValidElement(reactNode)) {
//         return reactNode;
//     }

//     // DndGridItem인 경우 - id, top, left, width, height, children 주입
//     if (reactNode.type === DndGridItem) {
//         const props = reactNode.props as { children?: React.ReactNode };
//         const itemProps = {
//             id: treeNode.id,
//             top: treeNode.top,
//             left: treeNode.left,
//             width: treeNode.width,
//             height: treeNode.height,
//             children: props.children, // 원본 children 유지
//         };
//         return React.cloneElement(reactNode, itemProps as any);
//     }

//     // DndGridSplit인 경우 - id만 주입
//     const idProps = {
//         id: treeNode.id,
//     };

//     // DndGridSplit인 경우
//     if (reactNode.type === DndGridSplit && treeNode.type === 'split') {
//         const props = reactNode.props as { children: React.ReactNode };
//         const childrenArray = React.Children.toArray(props.children);

//         if (childrenArray.length !== 2) {
//             console.warn('DndGridSplit should have exactly 2 children');
//             return reactNode;
//         }

//         return React.cloneElement(reactNode, {
//             ...idProps,
//             children: [
//                 injectLayoutToChildren(
//                     childrenArray[0],
//                     treeNode.primaryChild,
//                     options
//                 ),
//                 injectLayoutToChildren(
//                     childrenArray[1],
//                     treeNode.secondaryChild,
//                     options
//                 ),
//             ],
//         } as any);
//     }

//     return reactNode;
// }

export type DropQuadrant = 'top' | 'left' | 'right' | 'bottom';

export type CalculateQuadrantProps = {
    startLeft: number;
    startTop: number;
    width: number;
    height: number;
    mouseX: number;
    mouseY: number;
};
export const getQuadrantPosition = ({
    mouseX,
    mouseY,
    startLeft, //left
    startTop, //top
    height,
    width,
}: CalculateQuadrantProps): DropQuadrant => {
    const inclineY = Math.round(
        ((startLeft - mouseX) * height) / width + startTop + height
    );

    const declineY = Math.round(
        ((mouseX - startLeft) * height) / width + startTop
    );

    // console.log(`inc:${inclineY}, dec:${declineY},cur:${mouseY}`);
    if (mouseY <= inclineY && mouseY <= declineY) return 'top';
    if (mouseY <= inclineY && mouseY >= declineY) return 'left';
    if (mouseY >= inclineY && mouseY <= declineY) return 'right';
    return 'bottom';
};

// Shadow 표시 헬퍼
export function getQuadrantShadow(quadrant: DropQuadrant | null): string {
    if (quadrant === null) return '';
    const shadows: Record<DropQuadrant, string> = {
        top: 'inset 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        left: 'inset 10px 0 10px -5px rgba(0, 0, 0, 0.3)',
        right: 'inset -10px 0 10px -5px rgba(0, 0, 0, 0.3)',
        bottom: 'inset 0 -10px 10px -5px rgba(0, 0, 0, 0.3)',
    };

    return shadows[quadrant];
}

export function getSplitDirection(quadrant: DropQuadrant): DndSplitDirection {
    switch (quadrant) {
        case 'top':
            return 'horizontal';
        case 'bottom':
            return 'horizontal';
        case 'left':
            return 'vertical';
        default:
            return 'vertical';
    }
}

/**
 * Tree를 순회하여 모든 Item 노드를 flat array로 수집
 * @param treeNode - Tree의 루트 노드
 * @returns 모든 Item 노드의 배열
 */
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

/**
 * Tree 노드로부터 React 컴포넌트 트리를 생성 (원본 엘리먼트 참조 보존)
 * DnD로 구조가 변경되어도 tree.root의 실제 구조를 반영한 React 트리 생성
 * cloneElement를 사용하여 원본 엘리먼트 참조를 유지하고 layout props만 업데이트
 * @param treeNode - Tree의 ChildNode
 * @param options - 컴포넌트 타입
 * @returns React 노드
 */
// export function buildReactTreeFromNode(
//     treeNode: ChildNode,
//     options: ParseChildrenOptions
// ): React.ReactNode {
//     const { DndGridSplit, DndGridItem } = options;

//     if (!treeNode) return null;

//     const getElementFromCache = useTreeStore.getState().getElementFromCache;
//     const getChildrenFromCache = useTreeStore.getState().getChildrenFromCache;

//     // Item 노드인 경우
//     if (treeNode.type === 'item') {
//         const cachedElement = getElementFromCache(treeNode.id);
//         const cachedChildren = getChildrenFromCache(treeNode.id);

//         // 원본 엘리먼트가 있으면 cloneElement로 참조 유지
//         if (cachedElement) {
//             return React.cloneElement(cachedElement, {
//                 key: treeNode.id,
//                 id: treeNode.id,
//                 top: treeNode.top,
//                 left: treeNode.left,
//                 width: treeNode.width,
//                 height: treeNode.height,
//                 children: cachedChildren ?? treeNode.children,
//             } as any);
//         }

//         // fallback: 원본이 없으면 createElement (초기 렌더링시에만 발생)
//         return React.createElement(DndGridItem, {
//             key: treeNode.id,
//             id: treeNode.id,
//             top: treeNode.top,
//             left: treeNode.left,
//             width: treeNode.width,
//             height: treeNode.height,
//             children: cachedChildren ?? treeNode.children,
//         });
//     }

//     // Split 노드인 경우
//     if (treeNode.type === 'split') {
//         const primaryChild = buildReactTreeFromNode(
//             treeNode.primaryChild,
//             options
//         );
//         const secondaryChild = buildReactTreeFromNode(
//             treeNode.secondaryChild,
//             options
//         );

//         const cachedElement = getElementFromCache(treeNode.id);

//         // 원본 엘리먼트가 있으면 cloneElement로 참조 유지
//         if (cachedElement) {
//             return React.cloneElement(
//                 cachedElement,
//                 {
//                     key: treeNode.id,
//                     id: treeNode.id,
//                     direction: treeNode.direction,
//                     ratio: treeNode.ratio,
//                 } as any,
//                 [primaryChild, secondaryChild]
//             );
//         }

//         // fallback: 원본이 없으면 createElement (초기 렌더링시에만 발생)
//         return React.createElement(
//             DndGridSplit,
//             {
//                 key: treeNode.id,
//                 id: treeNode.id,
//                 direction: treeNode.direction,
//                 ratio: treeNode.ratio,
//             },
//             [primaryChild, secondaryChild]
//         );
//     }

//     return null;
// }
