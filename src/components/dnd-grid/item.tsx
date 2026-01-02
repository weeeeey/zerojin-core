import {
    getQuadrantPosition,
    getQuadrantShadow,
} from '../../actions/dnd-grid/util';

import { useTreeStore } from '../../actions/dnd-grid/store';
import { useMemo } from 'react';
import React from 'react';
import ItemDrag from './item-drag';
// import { useState } from 'react';

interface DndGridItemProps {
    id?: number;
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    children: React.ReactNode;
}

// TODO: children 추가하기
/**
[사용 흐름]
1. mousedown → startDrag(id)
2. mousemove (throttled) → setDropQuadrant(quadrant)
3. mouseenter/leave → setHoveredItem(id | null)
4. mouseup → store.handleDrop 호출
 */

export function DndGridItem({
    id,
    height,
    left,
    top,
    width,
    children,
}: DndGridItemProps) {
    // console.log(id);
    // dnd 대상들은 리렌더링으로 인해 상태 초기화 되는 이슈가 있음.
    // const [num, setNum] = useState(id || 0);

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

    // if (!height || !left || !top || !width) {
    //     throw new Error('grid item 생성 실패');
    // }

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

    // children을 순회하면서 ItemDrag 컴포넌트에 id를 주입
    const processedChildren = useMemo(() => {
        return React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === ItemDrag) {
                return React.cloneElement(child, { id } as any);
            }
            return child;
        });
    }, [id]);

    return (
        <div
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                position: 'absolute',
                width: `${width}px`,
                height: `${height}px`,
                top: `${top}px`,
                left: `${left}px`,
                border: '1px solid black',
                boxSizing: 'border-box',
                backgroundColor: isDragging ? '#d0d0d0' : '',
                cursor: isDragging ? 'grabbing' : 'grab',
                opacity: isDragging ? 0.5 : 1,
                boxShadow: isHovered ? getQuadrantShadow(dropQuadrant) : '',
            }}
        >
            Item {id} ({width}x{height})
            <div>
                <div>top:{top}</div>
                <div>left:{left}</div>
            </div>
            {processedChildren}
        </div>
    );
}
