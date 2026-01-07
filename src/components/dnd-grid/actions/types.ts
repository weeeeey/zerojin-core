import React from 'react';

export type NodeType = 'item' | 'split';
export type DndSplitDirection = 'horizontal' | 'vertical';
export type DropQuadrant = 'top' | 'left' | 'right' | 'bottom';

export interface ComponentNode {
    type: 'split' | 'item';
    id: number;

    // Split 컴포넌트인 경우
    direction?: 'horizontal' | 'vertical';
    ratio?: number;
    primary?: ComponentNode;
    secondary?: ComponentNode;

    // Item 컴포넌트인 경우
    children?: React.ReactNode;
}

export interface ParseChildrenOptions {
    DndGridSplit: React.ComponentType<any>;
    DndGridItem: React.ComponentType<any>;
    ItemDrag?: React.ComponentType<any>;
}

export type CalculateQuadrantProps = {
    startLeft: number;
    startTop: number;
    width: number;
    height: number;
    mouseX: number;
    mouseY: number;
};

export interface NodeSnapshot {
    id: number;
    width: number;
    height: number;
    top: number;
    left: number;
    primaryChildId?: number;
    secondaryChildId?: number;
}

