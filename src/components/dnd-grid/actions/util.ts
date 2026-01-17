import React from 'react';
import { ChildNode } from './tree';
import { useTreeStore } from './store';
import {
    ComponentNode,
    ParseChildrenOptions,
    DropQuadrant,
    CalculateQuadrantProps,
    DndSplitDirection,
} from './types';

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
    parentId: number = 0,
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
                `DndGridSplit expects exactly 2 children, got ${childrenArray.length}`,
            );
            return null;
        }

        const primary = parseChildren(childrenArray[0], options, nodeId * 2);
        const secondary = parseChildren(
            childrenArray[1],
            options,
            nodeId * 2 + 1,
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
    const props = node.props as { children?: React.ReactNode };

    // 원본 Item 엘리먼트와 children을 캐시에 저장
    const saveChildrenToCache = useTreeStore.getState().saveChildrenToCache;

    if (props.children) {
        saveChildrenToCache(nodeId, props.children);
    }

    return {
        type: 'item',
        id: nodeId,
        children: props.children,
    };
}

export const getQuadrantPosition = ({
    mouseX,
    mouseY,
    startLeft, //left
    startTop, //top
    height,
    width,
}: CalculateQuadrantProps): DropQuadrant => {
    const inclineY = Math.round(
        ((startLeft - mouseX) * height) / width + startTop + height,
    );

    const declineY = Math.round(
        ((mouseX - startLeft) * height) / width + startTop,
    );

    // console.log(`inc:${inclineY}, dec:${declineY},cur:${mouseY}`);
    if (mouseY <= inclineY && mouseY <= declineY) return 'top';
    if (mouseY <= inclineY && mouseY >= declineY) return 'left';
    if (mouseY >= inclineY && mouseY <= declineY) return 'right';
    return 'bottom';
};

/**
 * Shadow 표시 헬퍼
 * @deprecated 이 함수는 더 이상 내부적으로 사용되지 않습니다.
 * CSS의 `[data-drop-quadrant]` 선택자를 사용하여 스타일을 커스터마이징하세요.
 * 참고용으로 계속 export되지만, 향후 major 버전에서 제거될 예정입니다.
 */
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
export function collectAllItems(treeNode: ChildNode): {
    items: ChildNode[];
    splits: ChildNode[];
} {
    const items: ChildNode[] = [];
    const splits: ChildNode[] = [];
    const traverse = (node: ChildNode) => {
        if (node.type === 'item') {
            items.push(node);
        } else if (node.type === 'split') {
            splits.push(node);
            traverse(node.primaryChild);
            traverse(node.secondaryChild);
        }
    };

    traverse(treeNode);

    return {
        items,
        splits,
    };
}

/**
 * 클릭된 요소가 인터랙티브 요소인지 확인 (드래그를 시작하지 말아야 하는지)
 *
 * 이 함수는 DOM 트리를 상위로 순회하면서 클릭된 요소 또는 그 부모가
 * 버튼, 입력 필드, 링크 등 인터랙티브 요소인지 검사합니다.
 *
 * @param target - 클릭된 요소 (event.target)
 * @param dragContainer - 드래그 컨테이너 루트 요소 (순회 제한용)
 * @returns 드래그를 막아야 하면 true, 드래그를 시작해야 하면 false
 *
 * @example
 * ```tsx
 * const handleMouseDown = (e: React.MouseEvent) => {
 *     if (isInteractiveElement(e.target, containerRef.current)) {
 *         return; // 인터랙티브 요소이므로 드래그 시작하지 않음
 *     }
 *     // 드래그 시작...
 * };
 * ```
 */
export function isInteractiveElement(
    target: EventTarget | null,
    dragContainer: HTMLElement | null,
): boolean {
    // EventTarget이 아니거나 HTMLElement가 아닌 경우
    if (!target || !(target instanceof HTMLElement)) {
        return false;
    }

    let currentElement: HTMLElement | null = target;

    // dragContainer에 도달할 때까지 DOM 트리를 상위로 순회
    while (currentElement && currentElement !== dragContainer) {
        // disabled 또는 aria-disabled 요소는 인터랙티브가 아님
        if (
            currentElement.hasAttribute('disabled') ||
            currentElement.getAttribute('aria-disabled') === 'true'
        ) {
            currentElement = currentElement.parentElement;
            continue;
        }

        // 1. 표준 HTML 인터랙티브 요소 확인
        const tagName = currentElement.tagName.toLowerCase();
        const interactiveTags = [
            'button',
            'input',
            'textarea',
            'select',
            'option',
            'a',
            'label',
        ];
        if (interactiveTags.includes(tagName)) {
            return true;
        }

        // 2. contenteditable 속성 확인
        const contentEditable = currentElement.getAttribute('contenteditable');
        if (contentEditable === 'true' || contentEditable === '') {
            return true;
        }

        // 3. ARIA role 확인
        const role = currentElement.getAttribute('role');
        const interactiveRoles = [
            'button',
            'link',
            'textbox',
            'combobox',
            'listbox',
            'searchbox',
            'spinbutton',
            'slider',
            'switch',
            'tab',
            'menuitem',
            'menuitemcheckbox',
            'menuitemradio',
        ];
        if (role && interactiveRoles.includes(role)) {
            return true;
        }

        // 4. tabindex 확인 (>= 0인 경우 키보드 포커스 가능한 요소)
        const tabindex = currentElement.getAttribute('tabindex');
        if (tabindex !== null) {
            const tabindexValue = parseInt(tabindex, 10);
            if (!isNaN(tabindexValue) && tabindexValue >= 0) {
                return true;
            }
        }

        // 부모 요소로 이동
        currentElement = currentElement.parentElement;
    }

    // 인터랙티브 요소를 찾지 못함
    return false;
}
