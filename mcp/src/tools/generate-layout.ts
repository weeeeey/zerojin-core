import { z } from 'zod';
import { LayoutBuilder, L } from '../utils/layout-builder.js';
import { CodeGenerator } from '../utils/code-generator.js';
import { LayoutAnalyzer } from '../utils/layout-analyzer.js';
import { Validator } from '../utils/validator.js';
import type { LayoutNode } from '../types/layout.js';

/**
 * Input schema for generate-layout tool
 */
export const GenerateLayoutInputSchema = z.object({
  description: z
    .string()
    .describe(
      'Natural language description of desired layout (e.g., "3-panel IDE layout with sidebar, editor, and terminal")'
    ),
  components: z.array(z.string()).describe('List of component names to place in the layout'),
  containerWidth: z.number().optional().default(1200).describe('Container width in pixels'),
  containerHeight: z.number().optional().default(800).describe('Container height in pixels'),
  framework: z
    .enum(['react', 'nextjs-app', 'nextjs-pages'])
    .optional()
    .default('nextjs-app')
    .describe('Target framework (affects "use client" directive)'),
});

export type GenerateLayoutInput = z.infer<typeof GenerateLayoutInputSchema>;

/**
 * generate-layout tool implementation
 */
export async function generateLayout(args: GenerateLayoutInput) {
  const { description, components, containerWidth, containerHeight, framework } = args;

  // Analyze description to determine layout pattern
  const pattern = analyzeDescription(description, components);

  // Build layout based on pattern
  let layoutNode: LayoutNode;

  try {
    layoutNode = buildLayoutFromPattern(pattern, components);
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `❌ Failed to generate layout: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }

  // Create LayoutTree
  const layout = new LayoutBuilder(containerWidth, containerHeight)
    .setRoot(layoutNode)
    .build();

  // Generate code
  const generator = new CodeGenerator({
    framework,
    width: containerWidth,
    height: containerHeight,
  });
  const code = generator.generate(layout);

  // Analyze metadata
  const metadata = LayoutAnalyzer.calculateMetadata(layout);

  // Validate
  const validator = new Validator();
  const validation = validator.validate(layout, false);

  // Format output
  let output = `# Generated DndGrid Layout\n\n`;
  output += `**Description:** ${description}\n\n`;

  output += `## Layout Metadata\n\n`;
  output += `- **Items:** ${metadata.itemCount}\n`;
  output += `- **Splits:** ${metadata.splitCount}\n`;
  output += `- **Max Depth:** ${metadata.maxDepth}\n`;
  output += `- **Performance:** ${metadata.estimatedPerformance}\n`;
  output += `- **Pattern:** ${pattern.type}\n\n`;

  if (validation.warnings.length > 0) {
    output += `## Warnings\n\n`;
    validation.warnings.forEach((warn, i) => {
      output += `${i + 1}. ${warn.message}\n`;
    });
    output += '\n';
  }

  if (validation.suggestions.length > 0) {
    output += `## Suggestions\n\n`;
    validation.suggestions.forEach((sugg, i) => {
      output += `${i + 1}. ${sugg}\n`;
    });
    output += '\n';
  }

  output += `## Generated Code\n\n\`\`\`tsx\n${code}\`\`\`\n`;

  return {
    content: [{ type: 'text' as const, text: output }],
  };
}

/**
 * Layout patterns
 */
type LayoutPattern =
  | { type: 'ide'; sidebar: string; main: string; bottom: string }
  | { type: 'dashboard'; items: string[] }
  | { type: 'three-column'; left: string; center: string; right: string }
  | { type: 'split'; left: string; right: string; direction: 'horizontal' | 'vertical' }
  | { type: 'custom'; items: string[] };

/**
 * Analyze description to determine layout pattern
 */
function analyzeDescription(description: string, components: string[]): LayoutPattern {
  const lower = description.toLowerCase();

  // IDE pattern
  if (
    (lower.includes('ide') ||
      (lower.includes('sidebar') && lower.includes('editor')) ||
      lower.includes('3-panel')) &&
    components.length === 3
  ) {
    return {
      type: 'ide',
      sidebar: components[0],
      main: components[1],
      bottom: components[2],
    };
  }

  // Dashboard pattern (2x2 or grid)
  if (
    (lower.includes('dashboard') || lower.includes('grid') || lower.includes('2x2')) &&
    components.length === 4
  ) {
    return {
      type: 'dashboard',
      items: components,
    };
  }

  // Three column
  if (
    (lower.includes('three') || lower.includes('3')) &&
    lower.includes('column') &&
    components.length === 3
  ) {
    return {
      type: 'three-column',
      left: components[0],
      center: components[1],
      right: components[2],
    };
  }

  // Split view
  if (components.length === 2 && (lower.includes('split') || lower.includes('two'))) {
    const direction = lower.includes('horizontal') || lower.includes('top')
      ? 'horizontal'
      : 'vertical';
    return {
      type: 'split',
      left: components[0],
      right: components[1],
      direction,
    };
  }

  // Custom/fallback
  return {
    type: 'custom',
    items: components,
  };
}

/**
 * Build layout node from pattern
 */
function buildLayoutFromPattern(pattern: LayoutPattern, components: string[]): LayoutNode {
  switch (pattern.type) {
    case 'ide':
      return L.v(
        0.2,
        L.item(pattern.sidebar),
        L.h(0.7, L.item(pattern.main), L.item(pattern.bottom))
      );

    case 'dashboard':
      return L.h(
        0.5,
        L.v(0.5, L.item(pattern.items[0]), L.item(pattern.items[1])),
        L.v(0.5, L.item(pattern.items[2]), L.item(pattern.items[3]))
      );

    case 'three-column':
      return L.v(
        0.2,
        L.item(pattern.left),
        L.v(0.75, L.item(pattern.center), L.item(pattern.right))
      );

    case 'split':
      if (pattern.direction === 'horizontal') {
        return L.h(0.5, L.item(pattern.left), L.item(pattern.right));
      } else {
        return L.v(0.5, L.item(pattern.left), L.item(pattern.right));
      }

    case 'custom':
      // Simple fallback: vertical splits for all components
      if (components.length === 1) {
        return L.item(components[0]);
      }
      if (components.length === 2) {
        return L.v(0.5, L.item(components[0]), L.item(components[1]));
      }
      // For 3+ components, create nested vertical splits
      let node: LayoutNode = L.item(components[components.length - 1]);
      for (let i = components.length - 2; i >= 0; i--) {
        node = L.v(1 / (i + 2), L.item(components[i]), node);
      }
      return node;

    default:
      throw new Error(`Unknown pattern type: ${(pattern as any).type}`);
  }
}
