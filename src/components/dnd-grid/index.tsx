'use client';

import React, { Children, useLayoutEffect, useState } from 'react';
import { parseChildren, injectLayoutToChildren } from './util';

import { useTreeStore } from './store';

export default function DndGrid() {
    return (
        <DndGridContainer width={1000} height={1000}>
            <DndGridSplit direction="horizontal" ratio={0.5}>
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

        const tree = buildTree(componentTree, width, height);
        console.log(tree);

        const injectedChildren = injectLayoutToChildren(firstChild, tree.root, {
            DndGridSplit,
            DndGridItem,
        });

        setEnhancedChildren(injectedChildren);
    }, [buildTree]);

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
    id?: number;
}

function DndGridItem({ id }: DndGridItemProps) {
    const node = useTreeStore((state) =>
        id ? state.nodes.get(id) : undefined
    );

    if (!node) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                width: `${node.width}px`,
                height: `${node.height}px`,
                top: `${node.top}px`,
                left: `${node.left}px`,
                border: '1px solid black',
                boxSizing: 'border-box',
                backgroundColor: '#f0f0f0',
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
