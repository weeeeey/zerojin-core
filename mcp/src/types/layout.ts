/**
 * Layout type definitions for DndGrid MCP server
 */

export type DndSplitDirection = 'horizontal' | 'vertical';

export interface LayoutItem {
  type: 'item';
  component: string;
}

export interface LayoutSplit {
  type: 'split';
  direction: DndSplitDirection;
  ratio: number; // 0 < ratio < 1
  primary: LayoutNode;
  secondary: LayoutNode;
}

export type LayoutNode = LayoutItem | LayoutSplit;

export interface LayoutTree {
  type: 'container';
  width: number;
  height: number;
  child: LayoutNode;
}

export interface LayoutMetadata {
  splitCount: number;
  itemCount: number;
  maxDepth: number;
  estimatedPerformance: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ValidationError {
  type: 'syntax' | 'structure' | 'constraint';
  message: string;
  line?: number;
  column?: number;
  fix?: string;
}

export interface ValidationWarning {
  message: string;
  line?: number;
  suggestion?: string;
}
