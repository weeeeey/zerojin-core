'use client';

import React, { Children, useEffect, useLayoutEffect, useState } from 'react';
import { parseChildren, injectLayoutToChildren } from './util';
import Tree from './tree';
import { useTreeStore } from './store';

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
    const buildTree = useTreeStore((state) => state.buildTree);
    const tree = useTreeStore((v) => v.tree);

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

        // 2. Tree 생성 및 레이아웃 계산 (store에 저장)
        buildTree(componentTree, width, height);

        // console.log(tree);
        // 3. 계산된 ID를 children에 주입

        // if (!tree?.root) return;

        // const injectedChildren = injectLayoutToChildren(
        //     firstChild,
        //     tree?.root,
        //     {
        //         DndGridSplit,
        //         DndGridItem,
        //     }
        // );

        // setEnhancedChildren(injectedChildren);
    }, [buildTree]);

    useLayoutEffect(() => {
        const firstChild = Children.toArray(children)[0];
        console.log(tree);
        if (!tree || !tree.root) return;

        const injectedChildren = injectLayoutToChildren(
            firstChild,
            tree?.root,
            {
                DndGridSplit,
                DndGridItem,
            }
        );

        setEnhancedChildren(injectedChildren);
    }, [tree]);

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
    console.log(id, node);

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
        <div
            style={{
                position: 'absolute',
                width: `${node.width}px`,
                height: `${node.height}px`,
                top: `${node.top}px`,
                left: `${node.left}px`,
            }}
        >
            {primary}
            {secondary}
        </div>
    );
}

export { DndGridContainer, DndGridItem, DndGridSplit };
