'use client';

import React, { Children, useLayoutEffect, useState } from 'react';
import { parseChildren, injectLayoutToChildren } from './util';
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
    const [enhancedChildren, setEnhancedChildren] = useState<React.ReactNode>();

    useLayoutEffect(() => {
        const firstChild = Children.toArray(children)[0];

        // 1. ComponentNode 트리 파싱
        const componentTree = parseChildren(firstChild, {
            DndGridSplit,
            DndGridItem,
        });

        if (!componentTree) {
            console.warn('Failed to parse component tree');
            return;
        }

        // 2. Tree 생성 및 레이아웃 계산
        const tree = new Tree(width, height, componentTree);

        // 3. 계산된 레이아웃을 children에 주입
        const injectedChildren = injectLayoutToChildren(firstChild, tree.root, {
            DndGridSplit,
            DndGridItem,
        });

        setEnhancedChildren(injectedChildren);
    }, [children, width, height]);

    return (
        <div
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
    width?: number;
    height?: number;
    top?: number;
    left?: number;
}

function DndGridItem({ width, height, top, left }: DndGridItemProps) {
    return (
        <div
            style={{
                position: 'absolute',
                width: width ? `${width}px` : undefined,
                height: height ? `${height}px` : undefined,
                top: top ? `${top}px` : undefined,
                left: left ? `${left}px` : undefined,
                border: '1px solid black',
                boxSizing: 'border-box',
                backgroundColor: '#f0f0f0',
            }}
        >
            Item ({width}x{height})
        </div>
    );
}

interface DndGridSplitProps {
    children: [React.ReactNode, React.ReactNode];
    direction: 'horizontal' | 'vertical';
    ratio: number;
    width?: number;
    height?: number;
    top?: number;
    left?: number;
}

function DndGridSplit({
    children,
    direction,
    ratio,
    width,
    height,
    top,
    left,
}: DndGridSplitProps) {
    if (ratio < 0 || ratio > 1) {
        throw new Error(`ratio must be between 0 and 1, got ${ratio}`);
    }

    const [primary, secondary] = React.Children.toArray(children);

    return (
        <div
            style={{
                position: 'absolute',
                width: width ? `${width}px` : undefined,
                height: height ? `${height}px` : undefined,
                top: top ? `${top}px` : undefined,
                left: left ? `${left}px` : undefined,
            }}
        >
            {primary}
            {secondary}
        </div>
    );
}

export { DndGridContainer, DndGridItem, DndGridSplit };
