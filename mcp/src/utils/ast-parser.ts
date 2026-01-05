import { parse } from '@typescript-eslint/typescript-estree';
import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type { LayoutTree, LayoutNode, DndSplitDirection } from '../types/layout.js';

/**
 * Parses TypeScript/JSX code to extract DndGrid layout structure
 */
export class ASTParser {
  /**
   * Parse DndGrid code and extract LayoutTree
   */
  parse(code: string): LayoutTree | null {
    try {
      const ast = parse(code, {
        jsx: true,
        loc: true,
        range: true,
      });

      const container = this.findDndGridContainer(ast);
      if (!container) {
        return null;
      }

      return this.buildLayoutTree(container);
    } catch (error) {
      console.error('Failed to parse code:', error);
      return null;
    }
  }

  /**
   * Find DndGridContainer in AST
   */
  private findDndGridContainer(ast: TSESTree.Program): TSESTree.JSXElement | null {
    let container: TSESTree.JSXElement | null = null;

    const visit = (node: TSESTree.Node) => {
      if (node.type === 'JSXElement') {
        const openingElement = node.openingElement;
        if (this.isComponentName(openingElement.name, 'DndGridContainer')) {
          container = node;
          return;
        }
      }

      // Recursively visit children
      for (const key in node) {
        const child = (node as any)[key];
        if (child && typeof child === 'object') {
          if (Array.isArray(child)) {
            child.forEach(visit);
          } else if (child.type) {
            visit(child);
          }
        }
      }
    };

    visit(ast);
    return container;
  }

  /**
   * Build LayoutTree from DndGridContainer element
   */
  private buildLayoutTree(containerElement: TSESTree.JSXElement): LayoutTree | null {
    const props = this.extractProps(containerElement.openingElement);
    const width = this.getPropValue(props, 'width') as number;
    const height = this.getPropValue(props, 'height') as number;

    if (!width || !height) {
      return null;
    }

    // Find the child node
    const child = this.findFirstElementChild(containerElement);
    if (!child) {
      return null;
    }

    const childNode = this.buildLayoutNode(child);
    if (!childNode) {
      return null;
    }

    return {
      type: 'container',
      width,
      height,
      child: childNode,
    };
  }

  /**
   * Build LayoutNode from JSXElement
   */
  private buildLayoutNode(element: TSESTree.JSXElement): LayoutNode | null {
    const openingElement = element.openingElement;

    // Check if it's a DndGridSplit
    if (this.isComponentName(openingElement.name, 'DndGridSplit')) {
      return this.buildSplitNode(element);
    }

    // Check if it's a DndGridItem
    if (this.isComponentName(openingElement.name, 'DndGridItem')) {
      return this.buildItemNode(element);
    }

    return null;
  }

  /**
   * Build Split node
   */
  private buildSplitNode(element: TSESTree.JSXElement): LayoutNode | null {
    const props = this.extractProps(element.openingElement);
    const direction = this.getPropValue(props, 'direction') as DndSplitDirection;
    const ratio = this.getPropValue(props, 'ratio') as number;

    if (!direction || typeof ratio !== 'number') {
      return null;
    }

    // Get children (should be exactly 2)
    const children = this.findElementChildren(element);
    if (children.length !== 2) {
      return null;
    }

    const primary = this.buildLayoutNode(children[0]);
    const secondary = this.buildLayoutNode(children[1]);

    if (!primary || !secondary) {
      return null;
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
   * Build Item node
   */
  private buildItemNode(element: TSESTree.JSXElement): LayoutNode | null {
    // Find the first child component
    const child = this.findFirstElementChild(element);
    if (!child) {
      return null;
    }

    const componentName = this.getComponentName(child.openingElement.name);
    if (!componentName) {
      return null;
    }

    return {
      type: 'item',
      component: componentName,
    };
  }

  /**
   * Extract props from JSXOpeningElement
   */
  private extractProps(
    openingElement: TSESTree.JSXOpeningElement
  ): Map<string, TSESTree.Expression | TSESTree.Literal> {
    const props = new Map<string, TSESTree.Expression | TSESTree.Literal>();

    for (const attr of openingElement.attributes) {
      if (attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier') {
        const name = attr.name.name;
        const value = attr.value;

        if (value?.type === 'JSXExpressionContainer') {
          props.set(name, value.expression as TSESTree.Expression);
        } else if (value?.type === 'Literal') {
          props.set(name, value);
        }
      }
    }

    return props;
  }

  /**
   * Get prop value
   */
  private getPropValue(
    props: Map<string, TSESTree.Expression | TSESTree.Literal>,
    name: string
  ): string | number | boolean | null {
    const value = props.get(name);
    if (!value) return null;

    if (value.type === 'Literal') {
      return value.value as string | number | boolean;
    }

    // Handle simple cases
    if (value.type === 'Identifier') {
      return value.name;
    }

    return null;
  }

  /**
   * Find element children (excluding text nodes)
   */
  private findElementChildren(element: TSESTree.JSXElement): TSESTree.JSXElement[] {
    const children: TSESTree.JSXElement[] = [];

    for (const child of element.children) {
      if (child.type === 'JSXElement') {
        children.push(child);
      }
    }

    return children;
  }

  /**
   * Find first element child
   */
  private findFirstElementChild(element: TSESTree.JSXElement): TSESTree.JSXElement | null {
    for (const child of element.children) {
      if (child.type === 'JSXElement') {
        return child;
      }
    }
    return null;
  }

  /**
   * Check if a JSX name matches a component name
   */
  private isComponentName(
    name: TSESTree.JSXTagNameExpression,
    componentName: string
  ): boolean {
    if (name.type === 'JSXIdentifier') {
      return name.name === componentName;
    }
    return false;
  }

  /**
   * Get component name from JSX name
   */
  private getComponentName(name: TSESTree.JSXTagNameExpression): string | null {
    if (name.type === 'JSXIdentifier') {
      return name.name;
    }
    return null;
  }
}
