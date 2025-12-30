import { create } from 'zustand';
import Tree, { ChildNode } from './tree';
import { ComponentNode } from './util';
import type { DropQuadrant } from './util';
import React from 'react';

interface DragDropStore {
    draggedItemId: number | null; //- 현재 드래그 중인 아이템
    hoveredItemId: number | null; //- 드롭 타겟 후보 아이템
    dropQuadrant: DropQuadrant | null; //- 드롭될 사분면 (이미 타입은 util.ts:149에 정의됨)
    containerRef: React.RefObject<HTMLDivElement | null> | null; //- Container의 ref
    startDrag: (itemId: number) => void; //- 드래그 시작 시 호출
    endDrag: () => void; //- 마우스 업 시 호출, 드롭 처리 및 상태 초기화
    setHoveredItem: (itemId: number | null) => void; //- 마우스 엔터/리브 시 호출
    setDropQuadrant: (quadrant: DropQuadrant | null) => void; //- 마우스 무브 시 사분면 계산 후 호출
    setContainerRef: (ref: React.RefObject<HTMLDivElement | null>) => void; //- Container ref 설정
}

interface TreeStore extends DragDropStore {
    // 상태
    tree: Tree | null;
    nodes: Map<number, ChildNode>;

    // Tree 초기화
    buildTree: (
        componentTree: ComponentNode,
        width: number,
        height: number
    ) => Tree;

    // DnD 메서드
    // insertItemAt: (
    //     draggedItemId: number,
    //     targetItemId: number,
    //     quadrant: DropQuadrant
    // ) => void;

    // 노드 조회 헬퍼
    getNode: (id: number) => ChildNode | undefined;
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

export const useTreeStore = create<TreeStore>((set, get) => ({
    // 초기 상태
    tree: null,
    nodes: new Map(),

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
        const { draggedItemId, hoveredItemId, dropQuadrant, tree } = get();

        // 유효한 드롭인 경우만 insertItemAt 호출
        if (
            tree !== null &&
            draggedItemId !== null &&
            hoveredItemId !== null &&
            dropQuadrant !== null &&
            draggedItemId !== hoveredItemId
        ) {
            tree.restructureByDrop(draggedItemId, hoveredItemId, dropQuadrant);
        }

        // 드래그 상태 초기화
        set({
            draggedItemId: null,
            hoveredItemId: null,
            dropQuadrant: null,
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

    // DnD: draggedItem을 targetItem의 특정 사분면에 삽입
    // endDrop에서 한번에 처리하도록 일단 수정 중임
    // insertItemAt: (draggedItemId, targetItemId, quadrant) => {
    //     const { tree } = get();

    //     if (!tree) {
    //         console.warn('Tree not initialized');
    //         return;
    //     }

    //     // TODO: Tree.insertItemAt 메서드 구현 후 호출
    //     // tree.insertItemAt(draggedItemId, targetItemId, quadrant);

    //     // 트리 재구성 후 nodes 업데이트
    //     const nodes = flattenTreeToMap(tree.root);
    //     set({ nodes });

    //     console.log('Item inserted:', {
    //         draggedItemId,
    //         targetItemId,
    //         quadrant,
    //         nodeCount: nodes.size,
    //     });
    // },

    // 노드 조회
    getNode: (id) => {
        return get().nodes.get(id);
    },
}));
