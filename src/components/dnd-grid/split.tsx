'use client';

import React from 'react';

import { useTreeStore } from './actions/store';

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

    const childrenArray = React.Children.toArray(children);
    if (childrenArray.length !== 2) {
        throw new Error(
            'DndGrid Split 컴포넌트는 두개의 children을 필수로 가져야 합니다.'
        );
    }
    const [primary, secondary] = childrenArray;

    return (
        <div>
            {primary}
            {secondary}
        </div>
    );
}
