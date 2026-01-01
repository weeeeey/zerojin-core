import React from 'react';
import { DndSplitDirection } from './tree';
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
            ratio: +props.ratio.toFixed(2),
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
 * Tree에서 계산된 ID를 React children에 주입
 * @param reactNode - React 노드
 * @param treeNode - 계산된 ID를 가진 Tree 노드
 * @param options - 컴포넌트 타입 판별을 위한 옵션
 * @returns ID props가 주입된 React 노드
 */
export function injectLayoutToChildren(
    reactNode: React.ReactNode,
    treeNode: any, // ChildNode 타입 (GridItem | GridSplit)
    options: ParseChildrenOptions
): React.ReactNode {
    const { DndGridSplit, DndGridItem } = options;

    if (!React.isValidElement(reactNode)) {
        return reactNode;
    }

    // DndGridItem인 경우 - id, top, left, width, height 주입
    if (reactNode.type === DndGridItem) {
        const itemProps = {
            id: treeNode.id,
            top: treeNode.top,
            left: treeNode.left,
            width: treeNode.width,
            height: treeNode.height,
        };
        return React.cloneElement(reactNode, itemProps as any);
    }

    // DndGridSplit인 경우 - id만 주입
    const idProps = {
        id: treeNode.id,
    };

    // DndGridSplit인 경우
    if (reactNode.type === DndGridSplit && treeNode.type === 'split') {
        const props = reactNode.props as { children: React.ReactNode };
        const childrenArray = React.Children.toArray(props.children);

        if (childrenArray.length !== 2) {
            console.warn('DndGridSplit should have exactly 2 children');
            return reactNode;
        }

        return React.cloneElement(reactNode, {
            ...idProps,
            children: [
                injectLayoutToChildren(
                    childrenArray[0],
                    treeNode.primaryChild,
                    options
                ),
                injectLayoutToChildren(
                    childrenArray[1],
                    treeNode.secondaryChild,
                    options
                ),
            ],
        } as any);
    }

    return reactNode;
}

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
 * Tree 노드로부터 직접 React 컴포넌트 트리를 생성
 * DnD로 구조가 변경되어도 tree.root의 실제 구조를 반영한 React 트리 생성
 * @param treeNode - Tree의 ChildNode
 * @param options - 컴포넌트 타입
 * @returns React 노드
 */
export function buildReactTreeFromNode(
    treeNode: any, // ChildNode 타입 (GridItem | GridSplit)
    options: ParseChildrenOptions
): React.ReactNode {
    const { DndGridSplit, DndGridItem } = options;

    if (!treeNode) return null;

    // Item 노드인 경우
    if (treeNode.type === 'item') {
        return React.createElement(DndGridItem, {
            id: treeNode.id,
            top: treeNode.top,
            left: treeNode.left,
            width: treeNode.width,
            height: treeNode.height,
        });
    }

    // Split 노드인 경우
    if (treeNode.type === 'split') {
        const primaryChild = buildReactTreeFromNode(
            treeNode.primaryChild,
            options
        );
        const secondaryChild = buildReactTreeFromNode(
            treeNode.secondaryChild,
            options
        );

        return React.createElement(
            DndGridSplit,
            {
                id: treeNode.id,
                direction: treeNode.direction,
                ratio: treeNode.ratio,
            },
            [primaryChild, secondaryChild]
        );
    }

    return null;
}
