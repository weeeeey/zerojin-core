import { create } from 'zustand';
import Tree from './tree';
import { ComponentNode } from './util';
import type { DropQuadrant } from './util';

// Tree 노드 타입 (tree.ts에서 export되지 않아 any 사용)
type ChildNode = any;

interface TreeStore {
    // 상태
    tree: Tree | null;
    nodes: Map<number, ChildNode>;
    containerWidth: number;
    containerHeight: number;

    // Tree 초기화
    buildTree: (
        componentTree: ComponentNode,
        width: number,
        height: number
    ) => void;

    // DnD 메서드
    insertItemAt: (
        draggedItemId: number,
        targetItemId: number,
        quadrant: DropQuadrant
    ) => void;

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
    containerWidth: 0,
    containerHeight: 0,

    // Tree 초기화
    buildTree: (componentTree, width, height) => {
        const tree = new Tree(width, height, componentTree);
        const nodes = flattenTreeToMap(tree.root);

        set({
            tree,
            nodes,
            containerWidth: width,
            containerHeight: height,
        });

        console.log('Tree built:', {
            nodeCount: nodes.size,
            root: tree.root,
        });
    },

    // DnD: draggedItem을 targetItem의 특정 사분면에 삽입
    insertItemAt: (draggedItemId, targetItemId, quadrant) => {
        const { tree } = get();

        if (!tree) {
            console.warn('Tree not initialized');
            return;
        }

        // TODO: Tree.insertItemAt 메서드 구현 후 호출
        // tree.insertItemAt(draggedItemId, targetItemId, quadrant);

        // 트리 재구성 후 nodes 업데이트
        const nodes = flattenTreeToMap(tree.root);
        set({ nodes });

        console.log('Item inserted:', {
            draggedItemId,
            targetItemId,
            quadrant,
            nodeCount: nodes.size,
        });
    },

    // 노드 조회
    getNode: (id) => {
        return get().nodes.get(id);
    },
}));
