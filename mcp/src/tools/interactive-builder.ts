import { z } from 'zod';
import { BUILTIN_TEMPLATES } from '../types/template.js';

/**
 * Input schema for interactive-builder tool
 */
export const InteractiveBuilderInputSchema = z.object({
  action: z
    .enum(['list-templates', 'select-template', 'help'])
    .describe('Action to perform'),
  templateName: z.string().optional().describe('Template name (for select-template action)'),
});

export type InteractiveBuilderInput = z.infer<typeof InteractiveBuilderInputSchema>;

/**
 * interactive-builder tool implementation
 *
 * Simplified version that guides users through template selection
 */
export async function interactiveBuilder(args: InteractiveBuilderInput) {
  const { action, templateName } = args;

  let output = '';

  switch (action) {
    case 'list-templates':
      output = `# Available Templates\n\n`;
      Object.entries(BUILTIN_TEMPLATES).forEach(([key, template]) => {
        output += `## ${template.name} (\`${key}\`)\n\n`;
        output += `${template.description}\n\n`;
        output += `**Preview:**\n\`\`\`\n${template.preview}\n\`\`\`\n\n`;
        output += `**Required Components:**\n`;
        template.slots.forEach((slot) => {
          output += `- \`${slot}\`\n`;
        });
        output += `\n---\n\n`;
      });
      output += `## Next Steps\n\n`;
      output += `1. Choose a template that matches your needs\n`;
      output += `2. Use the \`apply-template\` tool with your component names\n`;
      output += `\nExample:\n\`\`\`\napply-template --templateName ide-layout --components '{"sidebar": "Sidebar", "editor": "CodeEditor", "terminal": "Terminal"}'\n\`\`\`\n`;
      break;

    case 'select-template':
      if (!templateName) {
        output = `❌ Please provide a template name.\n\nUse action="list-templates" to see available templates.`;
        break;
      }

      const template = BUILTIN_TEMPLATES[templateName];
      if (!template) {
        output = `❌ Template "${templateName}" not found.\n\nAvailable: ${Object.keys(BUILTIN_TEMPLATES).join(', ')}`;
        break;
      }

      output = `# Selected Template: ${template.name}\n\n`;
      output += `${template.description}\n\n`;
      output += `**Preview:**\n\`\`\`\n${template.preview}\n\`\`\`\n\n`;
      output += `## Required Components\n\n`;
      output += `You need to provide ${template.slots.length} components:\n\n`;
      template.slots.forEach((slot, i) => {
        output += `${i + 1}. **${slot}**: Your component name here\n`;
      });
      output += `\n## Apply This Template\n\n`;
      output += `Use the \`apply-template\` tool:\n\n`;
      output += `\`\`\`\n`;
      output += `templateName: "${templateName}"\n`;
      output += `components:\n`;
      template.slots.forEach((slot) => {
        output += `  ${slot}: "YourComponentName"\n`;
      });
      output += `\`\`\`\n`;
      break;

    case 'help':
      output = `# Interactive Layout Builder - Help\n\n`;
      output += `This tool helps you build DndGrid layouts interactively.\n\n`;
      output += `## Available Actions\n\n`;
      output += `1. **list-templates** - Show all available templates\n`;
      output += `2. **select-template** - Get details about a specific template\n`;
      output += `3. **help** - Show this help message\n\n`;
      output += `## Workflow\n\n`;
      output += `1. List templates to see what's available\n`;
      output += `2. Select a template that fits your needs\n`;
      output += `3. Use \`apply-template\` with your component names\n\n`;
      output += `## Other Tools\n\n`;
      output += `- **generate-layout** - Generate from natural language description\n`;
      output += `- **validate-layout** - Validate existing code\n`;
      output += `- **analyze-layout** - Analyze existing layout\n`;
      break;

    default:
      output = `❌ Unknown action: ${action}`;
  }

  return {
    content: [{ type: 'text' as const, text: output }],
  };
}
