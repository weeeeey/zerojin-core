'use client';

import React, {
    Children,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import {
    parseChildren,
    injectLayoutToChildren,
    getQuadrantPosition,
    getQuadrantShadow,
} from './util';

import { useTreeStore } from './store';

export default function DndGrid() {
    return (
        <DndGridContainer width={1000} height={1000}>
            <DndGridSplit direction="horizontal" ratio={0.24}>
                <DndGridSplit direction="vertical" ratio={0.6}>
                    <DndGridItem />
                    <DndGridSplit direction="horizontal" ratio={0.6}>
                        <DndGridItem />
                        <DndGridItem />
                    </DndGridSplit>
                </DndGridSplit>
                <DndGridSplit direction="vertical" ratio={0.6}>
                    <DndGridSplit direction="vertical" ratio={0.6}>
                        <DndGridItem />
                        <DndGridItem />
                    </DndGridSplit>
                    <DndGridItem />
                </DndGridSplit>
            </DndGridSplit>
        </DndGridContainer>
    );
}

function DndGridContainer({
    width,
    height,
    children,
}: {
    children: React.ReactNode;
    width: number;
    height: number;
}) {
    const [enhancedChildren, setEnhancedChildren] = useState<React.ReactNode>();
    const buildTree = useTreeStore((state) => state.buildTree);
    const setContainerRef = useTreeStore((state) => state.setContainerRef);
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const firstChild = Children.toArray(children)[0];

        const componentTree = parseChildren(firstChild, {
            DndGridSplit,
            DndGridItem,
        });

        if (!componentTree) {
            console.error('Failed to parse component tree');
            return;
        }

        const tree = buildTree(componentTree, width, height);

        const injectedChildren = injectLayoutToChildren(firstChild, tree.root, {
            DndGridSplit,
            DndGridItem,
        });

        setEnhancedChildren(injectedChildren);
    }, [buildTree]);

    useEffect(() => {
        if (containerRef.current) {
            setContainerRef(containerRef);
        }
    }, [setContainerRef]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: `${width}px`,
                height: `${height}px`,
            }}
        >
            {enhancedChildren}
        </div>
    );
}

interface DndGridItemProps {
    id?: number;
}

// TODO: children 추가하기
/**
[사용 흐름]
1. mousedown → startDrag(id)
2. mousemove (throttled) → setDropQuadrant(quadrant)
3. mouseenter/leave → setHoveredItem(id | null)
4. mouseup → store.handleDrop 호출
 */

function DndGridItem({ id }: DndGridItemProps) {
    const node = useTreeStore((state) =>
        id ? state.nodes.get(id) : undefined
    );
    const isDragging = useTreeStore((state) => state.draggedItemId === id);
    const isHovered = useTreeStore(
        (state) => state.hoveredItemId === id && state.draggedItemId !== id
    );
    const dropQuadrant = useTreeStore((state) =>
        state.hoveredItemId === id ? state.dropQuadrant : null
    );

    const startDrag = useTreeStore((state) => state.startDrag);
    const endDrag = useTreeStore((state) => state.endDrag);
    const setHoveredItem = useTreeStore((state) => state.setHoveredItem);
    const setDropQuadrant = useTreeStore((state) => state.setDropQuadrant);

    if (!node) {
        throw new Error('grid item 생성 실패');
    }

    const handleMouseDown = () => {
        if (!id) return;

        startDrag(id);

        let lastMoveTime = 0;
        const THROTTLE_MS = 16; // 60fps

        const handleMouseMove = (e: MouseEvent) => {
            const now = Date.now();

            // Throttle: 16ms 이내면 건너뛰기
            if (now - lastMoveTime < THROTTLE_MS) return;
            lastMoveTime = now;

            // 현재 호버된 아이템의 노드 정보 가져오기
            const state = useTreeStore.getState();
            const hoveredNode = state.hoveredItemId
                ? state.nodes.get(state.hoveredItemId)
                : null;

            if (!hoveredNode) {
                setDropQuadrant(null);
                return;
            }

            // Container의 뷰포트 기준 위치 가져오기
            const containerRect =
                state.containerRef?.current?.getBoundingClientRect();
            if (!containerRect) {
                setDropQuadrant(null);
                return;
            }

            // 마우스 좌표를 Container 기준 상대 좌표로 변환
            const relativeX = e.clientX - containerRect.left;
            const relativeY = e.clientY - containerRect.top;

            // 사분면 계산 (이제 같은 좌표계)
            const quadrant = getQuadrantPosition({
                mouseX: relativeX,
                mouseY: relativeY,
                startLeft: hoveredNode.left,
                startTop: hoveredNode.top,
                width: hoveredNode.width,
                height: hoveredNode.height,
            });

            setDropQuadrant(quadrant);
        };

        const handleMouseUp = () => {
            // 드래그 종료 시 상태 출력
            const state = useTreeStore.getState();
            console.log('=== 드래그 종료 ===');
            console.log('드래그된 아이템 ID:', state.draggedItemId);
            console.log('타겟 아이템 ID:', state.hoveredItemId);
            console.log('드롭 사분면:', state.dropQuadrant);
            console.log('================');

            endDrag();

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseEnter = () => {
        const state = useTreeStore.getState(); // 이벤트 시점의 최신값 가져오기
        const { draggedItemId } = state;

        if (id && draggedItemId !== null && draggedItemId !== id) {
            setHoveredItem(id);
        }
    };

    const handleMouseLeave = () => {
        const state = useTreeStore.getState(); // 이벤트 시점의 최신값 가져오기
        const { draggedItemId } = state;
        if (draggedItemId !== null) {
            setHoveredItem(null);
        }
    };

    return (
        <div
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                position: 'absolute',
                width: `${node.width}px`,
                height: `${node.height}px`,
                top: `${node.top}px`,
                left: `${node.left}px`,
                border: '1px solid black',
                boxSizing: 'border-box',
                backgroundColor: isDragging ? '#d0d0d0' : '',
                cursor: isDragging ? 'grabbing' : 'grab',
                opacity: isDragging ? 0.5 : 1,
                boxShadow: isHovered ? getQuadrantShadow(dropQuadrant) : '',
            }}
        >
            Item {id} ({node.width}x{node.height})
            <div>
                <div>top:{node.top}</div>
                <div>left:{node.left}</div>
            </div>
        </div>
    );
}

interface DndGridSplitProps {
    children: [React.ReactNode, React.ReactNode];
    direction: 'horizontal' | 'vertical';
    ratio: number;
    id?: number;
}

function DndGridSplit({ children, ratio, id }: DndGridSplitProps) {
    const node = useTreeStore((state) =>
        id ? state.nodes.get(id) : undefined
    );

    if (!node) return null;

    if (ratio < 0 || ratio > 1) {
        throw new Error(`ratio must be between 0 and 1, got ${ratio}`);
    }

    const [primary, secondary] = React.Children.toArray(children);

    return (
        <div>
            {primary}
            {secondary}
        </div>
    );
}

export { DndGridContainer, DndGridItem, DndGridSplit };
