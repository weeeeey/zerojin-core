'use client';

import { cn } from '../../../lib/util';
import { useTreeStore } from './actions/store';
import { getQuadrantPosition } from './actions/util';

export interface ItemDragProps {
    id?: number;
    children?: React.ReactNode;
    className?: string;
}

export function ItemDrag({ id, children, className }: ItemDragProps) {
    const startDrag = useTreeStore((state) => state.startDrag);
    const endDrag = useTreeStore((state) => state.endDrag);

    const setDropQuadrant = useTreeStore((state) => state.setDropQuadrant);

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
    return (
        <div
            className={cn('cursor-move', className)}
            onMouseDown={handleMouseDown}
        >
            {children}
        </div>
    );
}
