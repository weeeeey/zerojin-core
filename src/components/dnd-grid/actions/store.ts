import { create } from 'zustand';
import Tree, { ChildNode, cloneNode } from './tree';
import type { ComponentNode, DropQuadrant } from './types';

import React from 'react';

type TranslateProps = {
    x: number;
    y: number;
};

interface DragDropStore {
    draggedItemId: number | null; //- 현재 드래그 중인 아이템
    hoveredItemId: number | null; //- 드롭 타겟 후보 아이템
    dropQuadrant: DropQuadrant | null; //- 드롭될 사분면 (이미 타입은 util.ts:149에 정의됨)
    containerRef: React.RefObject<HTMLDivElement | null> | null; //- Container의 ref
    translates: TranslateProps;

    startDrag: (itemId: number) => void; //- 드래그 시작 시 호출
    endDrag: () => void; //- 마우스 업 시 호출, 드롭 처리 및 상태 초기화
    setHoveredItem: (itemId: number | null) => void; //- 마우스 엔터/리브 시 호출
    setDropQuadrant: (quadrant: DropQuadrant | null) => void; //- 마우스 무브 시 사분면 계산 후 호출
    setContainerRef: (ref: React.RefObject<HTMLDivElement | null>) => void; //- Container ref 설정
    setTranslates: (translates: TranslateProps) => void; //- Container translate 설정
}

interface TreeStore extends DragDropStore {
    tree: Tree | null;
    nodes: Map<number, ChildNode>;
    willRerenderNodes: Set<ChildNode>;
    childrenCache: Map<number, React.ReactNode>;
    elementsCache: Map<number, React.ReactElement>;

    buildTree: (
        componentTree: ComponentNode,
        width: number,
        height: number,
    ) => Tree;

    getNode: (id: number) => ChildNode | undefined;

    setWillRerenderNodes: (nodes: ChildNode[]) => void;
    resetWillRerenderNodes: () => void;
    saveChildrenToCache: (id: number, children: React.ReactNode) => void;
    getChildrenFromCache: (id: number) => React.ReactNode | undefined;
}

/**
 * Tree를 DFS 순회하여 ID → Node 매핑 생성
 */
function flattenTreeToMap(root: ChildNode): Map<number, ChildNode> {
    const map = new Map<number, ChildNode>();

    const dfs = (node: ChildNode) => {
        if (!node) return;

        // 노드를 Map에 추가
        map.set(node.id, node);

        // Split 노드면 자식들도 순회
        if (node.type === 'split') {
            dfs(node.primaryChild);
            dfs(node.secondaryChild);
        }
    };

    dfs(root);
    return map;
}

/**
 * 변경된 노드들만 복제하여 새로운 Map을 생성합니다.
 * affectedIds에 포함된 노드는 새 객체로 복제하고,
 * 그렇지 않은 노드는 기존 참조를 유지합니다.
 */
function cloneAffectedNodes(
    tree: Tree,
    affectedIds: Set<number>,
): Map<number, ChildNode> {
    const newNodes = new Map<number, ChildNode>();

    const traverse = (node: ChildNode): ChildNode => {
        // 이 노드가 영향받았다면 복제
        const processedNode = affectedIds.has(node.id) ? cloneNode(node) : node;

        // Split 노드라면 자식들도 순회
        if (node.type === 'split') {
            const clonedPrimary = traverse(node.primaryChild);
            const clonedSecondary = traverse(node.secondaryChild);

            // 자식이 변경되었다면 이 Split도 복제해야 함
            if (
                clonedPrimary !== node.primaryChild ||
                clonedSecondary !== node.secondaryChild
            ) {
                const splitClone =
                    processedNode === node ? cloneNode(node) : processedNode;
                if (splitClone.type === 'split') {
                    splitClone.primaryChild = clonedPrimary;
                    splitClone.secondaryChild = clonedSecondary;
                }
                newNodes.set(splitClone.id, splitClone);
                return splitClone;
            }
        }

        newNodes.set(processedNode.id, processedNode);
        return processedNode;
    };

    traverse(tree.root);
    return newNodes;
}

export const useTreeStore = create<TreeStore>((set, get) => ({
    // 초기 상태
    tree: null,
    nodes: new Map(),
    willRerenderNodes: new Set(),
    childrenCache: new Map(),
    elementsCache: new Map(),
    translates: { x: 0, y: 0 },

    draggedItemId: null,
    hoveredItemId: null,
    dropQuadrant: null,
    containerRef: null,

    // 드래그 시작
    startDrag: (itemId) => {
        set({
            draggedItemId: itemId,
            hoveredItemId: null,
            dropQuadrant: null,
        });
    },

    // 드래그 종료 (드롭 처리)
    endDrag: () => {
        const {
            draggedItemId,
            hoveredItemId,
            dropQuadrant,
            tree,
            setWillRerenderNodes,
        } = get();

        // 유효한 드롭인 경우만 처리
        if (
            tree !== null &&
            draggedItemId !== null &&
            hoveredItemId !== null &&
            dropQuadrant !== null &&
            draggedItemId !== hoveredItemId
        ) {
            // 1. 변경 전 트리 스냅샷 생성 (current tree)
            const snapshot = tree.createSnapshot();

            // 2. 트리 재구조화 (workInProgress tree로 변경)
            tree.restructureByDrop(draggedItemId, hoveredItemId, dropQuadrant);

            // 3. React reconciliation처럼 diff 수행
            const changedIds = tree.diffWithSnapshot(snapshot);

            // 4. 변경된 노드만 복제하여 새로운 Map 생성
            const newNodes = cloneAffectedNodes(tree, changedIds);

            // 5. Zustand 상태 업데이트
            set({ nodes: newNodes });

            const willRenderItemNodes: ChildNode[] = [];
            for (const key of changedIds) {
                const temp = newNodes.get(key);
                if (temp && temp.type === 'item') {
                    willRenderItemNodes.push(temp);
                }
            }

            setWillRerenderNodes(willRenderItemNodes);
        }

        // 드래그 상태 초기화
        set({
            draggedItemId: null,
            hoveredItemId: null,
            dropQuadrant: null,
            translates: { x: 0, y: 0 },
        });
    },

    // 호버 아이템 설정
    setHoveredItem: (itemId) => {
        const { draggedItemId } = get();

        // 자기 자신에게는 호버 불가
        if (itemId === draggedItemId) {
            set({ hoveredItemId: null, dropQuadrant: null });
            return;
        }

        set({ hoveredItemId: itemId });
    },

    // 드롭 사분면 설정
    setDropQuadrant: (quadrant) => {
        set({ dropQuadrant: quadrant });
    },

    // Container ref 설정
    setContainerRef: (ref) => {
        set({ containerRef: ref });
    },

    // Tree 초기화
    buildTree: (componentTree, width, height) => {
        const tree = new Tree(width, height, componentTree);
        const nodes = flattenTreeToMap(tree.root);

        set({
            tree,
            nodes,
        });

        return tree;
    },

    // 노드 조회
    getNode: (id) => {
        return get().nodes.get(id);
    },

    setWillRerenderNodes: (ids: ChildNode[]) =>
        set({
            willRerenderNodes: new Set(ids),
        }),
    resetWillRerenderNodes: () =>
        set({
            willRerenderNodes: new Set(),
        }),

    // Children 캐시 관리
    saveChildrenToCache: (id, children) => {
        const { childrenCache } = get();
        childrenCache.set(id, children);
    },
    getChildrenFromCache: (id) => {
        return get().childrenCache.get(id);
    },

    setTranslates: (translates) => set({ translates }),
}));
