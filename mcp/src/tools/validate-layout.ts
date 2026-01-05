import { z } from 'zod';
import { Validator } from '../utils/validator.js';
import { ASTParser } from '../utils/ast-parser.js';

/**
 * Input schema for validate-layout tool
 */
export const ValidateLayoutInputSchema = z.object({
  code: z.string().describe('DndGrid code to validate'),
  strict: z.boolean().optional().default(false).describe('Enable strict validation (includes performance checks)'),
});

export type ValidateLayoutInput = z.infer<typeof ValidateLayoutInputSchema>;

/**
 * validate-layout tool implementation
 */
export async function validateLayout(args: ValidateLayoutInput) {
  const { code, strict } = args;

  // First, validate code syntax
  const validator = new Validator();
  const codeValidation = validator.validateCode(code, strict);

  // Try to parse the code to get layout tree
  const parser = new ASTParser();
  const layout = parser.parse(code);

  let treeValidation = null;
  if (layout) {
    treeValidation = validator.validate(layout, strict);
  }

  // Combine results
  const allErrors = [...codeValidation.errors, ...(treeValidation?.errors || [])];
  const allWarnings = [...codeValidation.warnings, ...(treeValidation?.warnings || [])];
  const allSuggestions = [...codeValidation.suggestions, ...(treeValidation?.suggestions || [])];

  const valid = allErrors.length === 0;

  // Format output
  let output = `# DndGrid Layout Validation\n\n`;

  output += `**Status:** ${valid ? '✅ Valid' : '❌ Invalid'}\n\n`;

  if (allErrors.length > 0) {
    output += `## Errors (${allErrors.length})\n\n`;
    allErrors.forEach((err, i) => {
      output += `${i + 1}. **[${err.type}]** ${err.message}\n`;
      if (err.fix) {
        output += `   - Fix: \`${err.fix}\`\n`;
      }
      if (err.line) {
        output += `   - Line: ${err.line}\n`;
      }
      output += '\n';
    });
  }

  if (allWarnings.length > 0) {
    output += `## Warnings (${allWarnings.length})\n\n`;
    allWarnings.forEach((warn, i) => {
      output += `${i + 1}. ${warn.message}\n`;
      if (warn.suggestion) {
        output += `   - Suggestion: ${warn.suggestion}\n`;
      }
      output += '\n';
    });
  }

  if (allSuggestions.length > 0) {
    output += `## Suggestions\n\n`;
    allSuggestions.forEach((sugg, i) => {
      output += `${i + 1}. ${sugg}\n`;
    });
    output += '\n';
  }

  if (layout) {
    output += `## Layout Structure\n\n`;
    output += `- Items: ${countItems(layout.child)}\n`;
    output += `- Splits: ${countSplits(layout.child)}\n`;
    output += `- Max Depth: ${getMaxDepth(layout.child)}\n`;
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: output,
      },
    ],
  };
}

// Helper functions
function countItems(node: any): number {
  if (node.type === 'item') return 1;
  return countItems(node.primary) + countItems(node.secondary);
}

function countSplits(node: any): number {
  if (node.type === 'item') return 0;
  return 1 + countSplits(node.primary) + countSplits(node.secondary);
}

function getMaxDepth(node: any, depth: number = 1): number {
  if (node.type === 'item') return depth;
  return Math.max(
    getMaxDepth(node.primary, depth + 1),
    getMaxDepth(node.secondary, depth + 1)
  );
}
