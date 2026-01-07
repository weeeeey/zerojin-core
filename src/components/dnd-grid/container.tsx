'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { parseChildren, collectAllItems } from './actions/util';

import { DndGridItem, DndGridSplit } from './';

import { useTreeStore } from './actions/store';

export function DndGridContainer({
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
    const setContainerRef = useTreeStore((state) => state.setContainerRef);
    const resetWillRerenderNodes = useTreeStore(
        (state) => state.resetWillRerenderNodes
    );
    const willRerenderNodes = useTreeStore((state) => state.willRerenderNodes);
    const containerRef = useRef<HTMLDivElement>(null);

    // 트리 빌드 및 렌더링 로직 통합
    const rebuildTree = useCallback(() => {
        const tree = useTreeStore.getState().tree;

        if (!tree) {
            // 초기 빌드
            const componentTree = parseChildren(children, {
                DndGridSplit,
                DndGridItem,
            });

            if (!componentTree) {
                console.error('Failed to parse component tree');
                return;
            }

            buildTree(componentTree, width, height);
        }

        // 초기 렌더링과 DnD 후 모두 flat 렌더링 사용
        const currentTree = useTreeStore.getState().tree;
        if (!currentTree) return;

        const items = collectAllItems(currentTree.root);
        const getElementFromCache = useTreeStore.getState().getElementFromCache;
        const getChildrenFromCache =
            useTreeStore.getState().getChildrenFromCache;

        const renderedItems = items.map((item) => {
            const cachedElement = getElementFromCache(item.id);
            const cachedChildren = getChildrenFromCache(item.id);

            if (cachedElement) {
                return React.cloneElement(cachedElement, {
                    key: item.id,
                    id: item.id,
                    top: item.top,
                    left: item.left,
                    width: item.width,
                    height: item.height,
                    children: cachedChildren,
                } as any);
            }

            return React.createElement(DndGridItem, {
                key: item.id,
                id: item.id,
                top: item.top,
                left: item.left,
                width: item.width,
                height: item.height,
                children: cachedChildren,
            });
        });

        setEnhancedChildren(renderedItems);
    }, [children, width, height, buildTree]);

    // 초기화 및 containerRef 설정 통합
    useLayoutEffect(() => {
        if (containerRef.current) {
            setContainerRef(containerRef);
        }
        rebuildTree();
    }, [rebuildTree, setContainerRef]);

    // DnD 후 리렌더링만 처리
    useLayoutEffect(() => {
        if (willRerenderNodes.size === 0) return;

        rebuildTree();
        resetWillRerenderNodes();
    }, [willRerenderNodes, resetWillRerenderNodes, rebuildTree]);

    return (
        <div
            ref={containerRef}
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
