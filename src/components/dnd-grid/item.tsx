import { getQuadrantShadow } from '../../actions/dnd-grid/util';

import { useTreeStore } from '../../actions/dnd-grid/store';
import ItemDrag from './item-drag';
// import { useMemo } from 'react';
// import React from 'react';

interface DndGridItemProps {
    id?: number;
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    children: React.ReactNode;
}

export function DndGridItem({
    id,
    height,
    left,
    top,
    width,
    children,
}: DndGridItemProps) {
    const isDragging = useTreeStore((state) => state.draggedItemId === id);
    const isHovered = useTreeStore(
        (state) => state.hoveredItemId === id && state.draggedItemId !== id
    );
    const dropQuadrant = useTreeStore((state) =>
        state.hoveredItemId === id ? state.dropQuadrant : null
    );

    const setHoveredItem = useTreeStore((state) => state.setHoveredItem);

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

    // children을 순회하면서 필요한 컴포넌트에만 props 주입
    // const processedChildren = useMemo(() => {
    //     console.log('rerender item', id);

    //     return React.Children.map(children, (child) => {
    //         if (!React.isValidElement(child)) {
    //             return child;
    //         }

    //         // displayName이 'ItemContent'인 경우
    //         const displayName = (child.type as any)?.displayName;

    //         if (displayName === 'ItemContent') {
    //             const childProps = child.props as any;

    //             // children 참조가 동일하고 id도 동일하면 원본 참조 반환 (cloneElement 방지)
    //             if (childProps.id === id) {
    //                 return child;
    //             }

    //             // id만 다른 경우에만 cloneElement (초기 렌더링 시)
    //             return React.cloneElement(child, {
    //                 id,
    //                 key: `content-${id}`,
    //             } as any);
    //         }

    //         // 다른 컴포넌트(ItemDrag 등)는 id 주입
    //         return React.cloneElement(child, { id } as any);
    //     });
    // }, [id, children]);

    return (
        <div
            key={id}
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
                overflow: 'hidden',
            }}
        >
            Item {id} ({width}x{height})
            <div>
                <div>top:{top}</div>
                <div>left:{left}</div>
            </div>
            <ItemDrag id={id || 10} />
            {children}
        </div>
    );
}
