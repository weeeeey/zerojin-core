import type { LayoutTree, LayoutNode, LayoutSplit, LayoutItem } from '../types/layout.js';

export interface GenerateOptions {
  framework: 'react' | 'nextjs-app' | 'nextjs-pages';
  width: number;
  height: number;
  componentPrefix?: string;
}

/**
 * Generates TypeScript/JSX code from LayoutTree
 */
export class CodeGenerator {
  private options: GenerateOptions;

  constructor(options: GenerateOptions) {
    this.options = options;
  }

  /**
   * Generate complete component code
   */
  generate(layout: LayoutTree): string {
    const useClient = this.shouldAddUseClient();
    const imports = this.generateImports();
    const jsx = this.generateJSX(layout.child, 2);

    const code = `${useClient}${imports}

export default function DndGridLayout() {
  return (
    <DndGridContainer width={${layout.width}} height={${layout.height}}>
${jsx}
    </DndGridContainer>
  );
}
`;

    return this.formatCode(code);
  }

  /**
   * Check if "use client" directive is needed
   */
  private shouldAddUseClient(): string {
    if (this.options.framework === 'nextjs-app') {
      return '"use client";\n\n';
    }
    return '';
  }

  /**
   * Generate import statements
   */
  private generateImports(): string {
    const imports: string[] = [];

    // DndGrid components import
    imports.push(
      `import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';`
    );

    return imports.join('\n');
  }

  /**
   * Generate JSX for a layout node
   */
  private generateJSX(node: LayoutNode, indent: number): string {
    const spaces = ' '.repeat(indent);

    if (node.type === 'item') {
      return this.generateItemJSX(node, indent);
    }

    return this.generateSplitJSX(node, indent);
  }

  /**
   * Generate JSX for a GridItem
   */
  private generateItemJSX(node: LayoutItem, indent: number): string {
    const spaces = ' '.repeat(indent);
    const innerSpaces = ' '.repeat(indent + 2);
    const componentName = this.options.componentPrefix
      ? `${this.options.componentPrefix}${node.component}`
      : node.component;

    return `${spaces}<DndGridItem>
${innerSpaces}<${componentName} />
${spaces}</DndGridItem>`;
  }

  /**
   * Generate JSX for a GridSplit
   */
  private generateSplitJSX(node: LayoutSplit, indent: number): string {
    const spaces = ' '.repeat(indent);
    const primaryJSX = this.generateJSX(node.primary, indent + 2);
    const secondaryJSX = this.generateJSX(node.secondary, indent + 2);

    return `${spaces}<DndGridSplit direction="${node.direction}" ratio={${node.ratio}}>
${primaryJSX}
${secondaryJSX}
${spaces}</DndGridSplit>`;
  }

  /**
   * Format generated code
   */
  private formatCode(code: string): string {
    // Basic formatting - can be enhanced with prettier later
    return code.trim() + '\n';
  }
}

/**
 * Helper function to quickly generate code
 */
export function generateCode(layout: LayoutTree, options: GenerateOptions): string {
  const generator = new CodeGenerator(options);
  return generator.generate(layout);
}
