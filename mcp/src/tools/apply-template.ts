import { z } from 'zod';
import { BUILTIN_TEMPLATES, type TemplateNode } from '../types/template.js';
import type { LayoutTree, LayoutNode } from '../types/layout.js';
import { CodeGenerator } from '../utils/code-generator.js';

/**
 * Input schema for apply-template tool
 */
export const ApplyTemplateInputSchema = z.object({
  templateName: z
    .enum(['ide-layout', 'dashboard-2x2', 'three-column', 'split-view'])
    .describe('Template to apply'),
  components: z
    .record(z.string())
    .describe('Mapping of template slots to component names'),
  width: z.number().optional().default(1200).describe('Container width'),
  height: z.number().optional().default(800).describe('Container height'),
  framework: z
    .enum(['react', 'nextjs-app', 'nextjs-pages'])
    .optional()
    .default('nextjs-app')
    .describe('Target framework'),
});

export type ApplyTemplateInput = z.infer<typeof ApplyTemplateInputSchema>;

/**
 * apply-template tool implementation
 */
export async function applyTemplate(args: ApplyTemplateInput) {
  const { templateName, components, width, height, framework } = args;

  const template = BUILTIN_TEMPLATES[templateName];
  if (!template) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `❌ Template "${templateName}" not found.\n\nAvailable templates: ${Object.keys(BUILTIN_TEMPLATES).join(', ')}`,
        },
      ],
    };
  }

  // Validate that all required slots are provided
  const missingSlots = template.slots.filter((slot) => !components[slot]);
  if (missingSlots.length > 0) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `❌ Missing component mappings for slots: ${missingSlots.join(', ')}\n\nRequired slots: ${template.slots.join(', ')}`,
        },
      ],
    };
  }

  // Apply components to template slots
  const layoutNode = applyComponentsToSlots(template.tree, components);

  // Build LayoutTree
  const layout: LayoutTree = {
    type: 'container',
    width,
    height,
    child: layoutNode,
  };

  // Generate code
  const generator = new CodeGenerator({
    framework,
    width,
    height,
  });
  const code = generator.generate(layout);

  // Format output
  let output = `# Applied Template: ${template.name}\n\n`;
  output += `${template.description}\n\n`;
  output += `## Preview\n\n\`\`\`\n${template.preview}\n\`\`\`\n\n`;
  output += `## Component Mapping\n\n`;
  template.slots.forEach((slot) => {
    output += `- **${slot}:** ${components[slot]}\n`;
  });
  output += `\n## Generated Code\n\n\`\`\`tsx\n${code}\`\`\`\n`;

  return {
    content: [{ type: 'text' as const, text: output }],
  };
}

/**
 * Apply component mappings to template slots
 */
function applyComponentsToSlots(
  templateNode: TemplateNode,
  components: Record<string, string>
): LayoutNode {
  if (templateNode.type === 'item') {
    if (!templateNode.slot) {
      throw new Error('Template item node missing slot');
    }
    const component = components[templateNode.slot];
    if (!component) {
      throw new Error(`No component provided for slot: ${templateNode.slot}`);
    }
    return {
      type: 'item',
      component,
    };
  }

  // Split node
  if (!templateNode.primary || !templateNode.secondary) {
    throw new Error('Template split node missing children');
  }

  return {
    type: 'split',
    direction: templateNode.direction!,
    ratio: templateNode.ratio!,
    primary: applyComponentsToSlots(templateNode.primary, components),
    secondary: applyComponentsToSlots(templateNode.secondary, components),
  };
}
