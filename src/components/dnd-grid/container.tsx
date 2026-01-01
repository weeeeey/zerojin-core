import React, {
    Children,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import {
    parseChildren,
    injectLayoutToChildren,
    buildReactTreeFromNode,
} from '../../actions/dnd-grid/util';

import { DndGridItem } from './item';
import { DndGridSplit } from './split';

import { useTreeStore } from '../../actions/dnd-grid/store';

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

    // 초기 렌더링 시 DOM에 삽입 전 자식 컴포넌트들에게 id 값 부여
    useLayoutEffect(() => {
        const firstChild = Children.toArray(children)[0];

        const componentTree = parseChildren(firstChild, {
            DndGridSplit,
            DndGridItem,
        });

        if (!componentTree) {
            console.error('Failed to parse component tree');
            return;
        }

        const tree = buildTree(componentTree, width, height);

        const injectedChildren = injectLayoutToChildren(firstChild, tree.root, {
            DndGridSplit,
            DndGridItem,
        });

        setEnhancedChildren(injectedChildren);
    }, []);

    // dnd 작업 시 mouse의 상대적인 위치값을 위한 등록
    useEffect(() => {
        if (containerRef.current) {
            setContainerRef(containerRef);
        }
    }, [setContainerRef]);

    useLayoutEffect(() => {
        if (willRerenderNodes.size === 0) return;

        const tree = useTreeStore.getState().tree;
        if (!tree) return;

        // tree.root로부터 직접 React 트리를 생성하여 구조 변경 반영
        const updatedChildren = buildReactTreeFromNode(tree.root, {
            DndGridSplit,
            DndGridItem,
        });

        setEnhancedChildren(updatedChildren);
        resetWillRerenderNodes();
    }, [willRerenderNodes, resetWillRerenderNodes]);

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
