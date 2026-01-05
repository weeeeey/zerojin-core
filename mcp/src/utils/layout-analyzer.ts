import type { LayoutTree, LayoutNode, LayoutMetadata } from '../types/layout.js';

/**
 * Analyzes layout tree and extracts metadata
 */
export class LayoutAnalyzer {
  /**
   * Calculate layout metadata
   */
  static calculateMetadata(layout: LayoutTree): LayoutMetadata {
    const stats = this.analyzeNode(layout.child);

    const itemCount = stats.itemCount;
    const maxDepth = stats.maxDepth;

    // Estimate performance based on complexity
    let estimatedPerformance: LayoutMetadata['estimatedPerformance'];
    if (itemCount <= 10 && maxDepth <= 3) {
      estimatedPerformance = 'excellent';
    } else if (itemCount <= 20 && maxDepth <= 4) {
      estimatedPerformance = 'good';
    } else if (itemCount <= 50 && maxDepth <= 6) {
      estimatedPerformance = 'fair';
    } else {
      estimatedPerformance = 'poor';
    }

    return {
      splitCount: stats.splitCount,
      itemCount: stats.itemCount,
      maxDepth: stats.maxDepth,
      estimatedPerformance,
    };
  }

  /**
   * Recursively analyze a node
   */
  private static analyzeNode(
    node: LayoutNode,
    depth: number = 1
  ): {
    splitCount: number;
    itemCount: number;
    maxDepth: number;
  } {
    if (node.type === 'item') {
      return {
        splitCount: 0,
        itemCount: 1,
        maxDepth: depth,
      };
    }

    // Split node
    const primaryStats = this.analyzeNode(node.primary, depth + 1);
    const secondaryStats = this.analyzeNode(node.secondary, depth + 1);

    return {
      splitCount: 1 + primaryStats.splitCount + secondaryStats.splitCount,
      itemCount: primaryStats.itemCount + secondaryStats.itemCount,
      maxDepth: Math.max(primaryStats.maxDepth, secondaryStats.maxDepth),
    };
  }

  /**
   * Count total items in tree
   */
  static countItems(node: LayoutNode): number {
    if (node.type === 'item') return 1;
    return this.countItems(node.primary) + this.countItems(node.secondary);
  }

  /**
   * Count total splits in tree
   */
  static countSplits(node: LayoutNode): number {
    if (node.type === 'item') return 0;
    return 1 + this.countSplits(node.primary) + this.countSplits(node.secondary);
  }

  /**
   * Calculate maximum depth
   */
  static getMaxDepth(node: LayoutNode, currentDepth: number = 1): number {
    if (node.type === 'item') return currentDepth;
    return Math.max(
      this.getMaxDepth(node.primary, currentDepth + 1),
      this.getMaxDepth(node.secondary, currentDepth + 1)
    );
  }

  /**
   * Collect all component names
   */
  static collectComponents(node: LayoutNode): string[] {
    if (node.type === 'item') {
      return [node.component];
    }
    return [
      ...this.collectComponents(node.primary),
      ...this.collectComponents(node.secondary),
    ];
  }
}
