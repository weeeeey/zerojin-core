import React from 'react';

export interface ComponentNode {
    type: 'split' | 'item';
    id: number;

    // Split 컴포넌트인 경우
    direction?: 'horizontal' | 'vertical';
    ratio?: number;
    primary?: ComponentNode;
    secondary?: ComponentNode;
}

interface ParseChildrenOptions {
    DndGridSplit: React.ComponentType<any>;
    DndGridItem: React.ComponentType<any>;
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
    const { DndGridSplit, DndGridItem } = options;

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

        return {
            type: 'split',
            id: nodeId,
            direction: props.direction,
            ratio: props.ratio,
            primary,
            secondary,
        };
    }

    // DndGridItem 컴포넌트인 경우
    if (node.type === DndGridItem) {
        return {
            type: 'item',
            id: nodeId,
        };
    }

    // 알 수 없는 컴포넌트
    console.warn('Unknown component type:', node.type);
    return null;
}

/**
 * ComponentNode 트리를 DFS 순회하여 모든 노드를 배열로 변환
 * @param root - 루트 ComponentNode
 * @returns ComponentNode 배열 (인덱스 = ID)
 */
// export function flattenComponentTree(
//     root: ComponentNode | null
// ): ComponentNode[] {
//     if (!root) return [];

//     const result: ComponentNode[] = [];

//     const dfs = (node: ComponentNode) => {
//         // 현재 노드를 배열의 ID 위치에 저장
//         result[node.id] = node;

//         // Split 노드인 경우 자식들도 재귀적으로 처리
//         if (node.type === 'split' && node.primary && node.secondary) {
//             dfs(node.primary);
//             dfs(node.secondary);
//         }
//     };

//     dfs(root);
//     return result;
// }
