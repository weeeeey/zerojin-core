'use client';

import { cn } from '../../../lib/util';
import { getQuadrantShadow } from '../../actions/dnd-grid/util';

import { useTreeStore } from '../../actions/dnd-grid/store';

import React, { useMemo } from 'react';
import { ItemDrag, ItemDragProps } from './item-drag';

interface DndGridItemProps {
    id?: number;
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    className?: string;
    allowDrop?: boolean;
    children: React.ReactNode;
}

export function DndGridItem({
    id,
    height,
    left,
    top,
    width,
    className,
    allowDrop = true,
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
        if (!allowDrop) return;

        const state = useTreeStore.getState(); // 이벤트 시점의 최신값 가져오기
        const { draggedItemId } = state;

        if (id && draggedItemId !== null && draggedItemId !== id) {
            setHoveredItem(id);
        }
    };

    const handleMouseLeave = () => {
        if (!allowDrop) return;

        const state = useTreeStore.getState(); // 이벤트 시점의 최신값 가져오기
        const { draggedItemId } = state;
        if (draggedItemId !== null) {
            setHoveredItem(null);
        }
    };

    const injectedChildren = useMemo(
        () =>
            React.Children.map(children, (child) => {
                if (
                    React.isValidElement<ItemDragProps>(child) &&
                    child.type === ItemDrag
                ) {
                    return React.cloneElement(child, {
                        id,
                    });
                }

                return child;
            }),
        [children, id]
    );

    return (
        <div
            key={id}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                'absolute border border-black box-border overflow-hidden',
                isDragging ? 'bg-[#d0d0d0]  opacity-50' : '',
                className
            )}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                top: `${top}px`,
                left: `${left}px`,
                boxShadow: isHovered ? getQuadrantShadow(dropQuadrant) : '',
            }}
        >
            {injectedChildren}
        </div>
    );
}
