'use client';

import React from 'react';

import { useTreeStore } from '../../actions/dnd-grid/store';

interface DndGridSplitProps {
    children: [React.ReactNode, React.ReactNode];
    direction: 'horizontal' | 'vertical';
    ratio: number;
    id?: number;
}

export function DndGridSplit({ children, ratio, id }: DndGridSplitProps) {
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
