'use client';

import React, { Children, useLayoutEffect } from 'react';
import { parseChildren } from './util';
import Tree from './tree';

export default function DndGrid() {
    return (
        <DndGridContainer width={1000} height={1000}>
            <DndGridSplit direction="horizontal" ratio={0.5}>
                <DndGridSplit direction="vertical" ratio={0.6}>
                    <DndGridItem />
                    <DndGridItem />
                </DndGridSplit>

                <DndGridItem />
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
    useLayoutEffect(() => {
        const componentTree = parseChildren(Children.toArray(children)[0], {
            DndGridSplit,
            DndGridItem,
        });

        if (!componentTree) {
            console.warn('Failed to parse component tree');
            return;
        }

        const tree = new Tree(width, height, componentTree);
    }, [children]);

    return <div>{children}</div>;
}

function DndGridItem() {
    return <div>item</div>;
}

interface DndGridSplitProps {
    children: [React.ReactNode, React.ReactNode];
    direction: 'horizontal' | 'vertical';
    ratio: number;
}

function DndGridSplit({ children, direction, ratio }: DndGridSplitProps) {
    if (ratio < 0 || ratio > 1) {
        throw new Error(`ratio must be between 0 and 1, got ${ratio}`);
    }

    const [primary, secondary] = React.Children.toArray(children);

    return (
        <div>
            <div>{primary}</div>
            <div>{secondary}</div>
        </div>
    );
}

export { DndGridContainer, DndGridItem, DndGridSplit };
