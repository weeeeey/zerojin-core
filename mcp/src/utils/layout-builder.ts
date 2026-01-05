import type {
  LayoutTree,
  LayoutNode,
  LayoutSplit,
  LayoutItem,
  DndSplitDirection,
} from '../types/layout.js';

/**
 * Builder for constructing LayoutTree programmatically
 */
export class LayoutBuilder {
  private width: number;
  private height: number;
  private root: LayoutNode | null = null;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * Create an Item node
   */
  static item(component: string): LayoutItem {
    return {
      type: 'item',
      component,
    };
  }

  /**
   * Create a Split node
   */
  static split(
    direction: DndSplitDirection,
    ratio: number,
    primary: LayoutNode,
    secondary: LayoutNode
  ): LayoutSplit {
    // Validate ratio
    if (ratio <= 0 || ratio >= 1) {
      throw new Error(`Invalid ratio ${ratio}. Must be between 0 and 1 (exclusive)`);
    }

    return {
      type: 'split',
      direction,
      ratio,
      primary,
      secondary,
    };
  }

  /**
   * Set the root node
   */
  setRoot(node: LayoutNode): this {
    this.root = node;
    return this;
  }

  /**
   * Build the final LayoutTree
   */
  build(): LayoutTree {
    if (!this.root) {
      throw new Error('Root node not set. Call setRoot() first.');
    }

    return {
      type: 'container',
      width: this.width,
      height: this.height,
      child: this.root,
    };
  }

  /**
   * Helper: Create horizontal split (top/bottom)
   */
  static horizontalSplit(
    ratio: number,
    top: LayoutNode,
    bottom: LayoutNode
  ): LayoutSplit {
    return this.split('horizontal', ratio, top, bottom);
  }

  /**
   * Helper: Create vertical split (left/right)
   */
  static verticalSplit(
    ratio: number,
    left: LayoutNode,
    right: LayoutNode
  ): LayoutSplit {
    return this.split('vertical', ratio, left, right);
  }
}

/**
 * Quick builder functions
 */
export const L = {
  item: LayoutBuilder.item,
  split: LayoutBuilder.split,
  h: LayoutBuilder.horizontalSplit,
  v: LayoutBuilder.verticalSplit,
};

/**
 * Example usage:
 * ```ts
 * const tree = new LayoutBuilder(1200, 800)
 *   .setRoot(
 *     L.v(0.2,
 *       L.item('Sidebar'),
 *       L.h(0.7,
 *         L.item('Editor'),
 *         L.item('Terminal')
 *       )
 *     )
 *   )
 *   .build();
 * ```
 */
