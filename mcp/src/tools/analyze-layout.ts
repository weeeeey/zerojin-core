import { z } from 'zod';
import { ASTParser } from '../utils/ast-parser.js';
import { Validator } from '../utils/validator.js';
import { LayoutAnalyzer } from '../utils/layout-analyzer.js';

/**
 * Input schema for analyze-layout tool
 */
export const AnalyzeLayoutInputSchema = z.object({
  code: z.string().describe('DndGrid code to analyze'),
  analyzePerformance: z.boolean().optional().default(true).describe('Include performance analysis'),
  checkBestPractices: z.boolean().optional().default(true).describe('Check against best practices'),
});

export type AnalyzeLayoutInput = z.infer<typeof AnalyzeLayoutInputSchema>;

/**
 * analyze-layout tool implementation
 */
export async function analyzeLayout(args: AnalyzeLayoutInput) {
  const { code, analyzePerformance, checkBestPractices } = args;

  let output = `# DndGrid Layout Analysis\n\n`;

  // Parse the code
  const parser = new ASTParser();
  const layout = parser.parse(code);

  if (!layout) {
    output += `❌ **Failed to parse layout**\n\n`;
    output += `The code does not contain a valid DndGrid structure.\n`;
    return {
      content: [{ type: 'text' as const, text: output }],
    };
  }

  // Structure analysis
  output += `## Structure\n\n`;
  const metadata = LayoutAnalyzer.calculateMetadata(layout);
  output += `- **Container:** ${layout.width}x${layout.height}px\n`;
  output += `- **Items:** ${metadata.itemCount}\n`;
  output += `- **Splits:** ${metadata.splitCount}\n`;
  output += `- **Max Depth:** ${metadata.maxDepth} levels\n`;
  output += `- **Components:** ${LayoutAnalyzer.collectComponents(layout.child).join(', ')}\n\n`;

  // Performance analysis
  if (analyzePerformance) {
    output += `## Performance\n\n`;
    output += `**Score:** ${metadata.estimatedPerformance}\n\n`;

    const recommendations: string[] = [];

    if (metadata.itemCount > 20) {
      recommendations.push(`Reduce item count from ${metadata.itemCount} to < 20 for better performance`);
    }

    if (metadata.maxDepth > 4) {
      recommendations.push(`Reduce tree depth from ${metadata.maxDepth} to < 4 levels`);
    }

    if (metadata.splitCount > metadata.itemCount) {
      recommendations.push('More splits than items - consider simplifying structure');
    }

    if (recommendations.length > 0) {
      output += `**Recommendations:**\n\n`;
      recommendations.forEach((rec, i) => {
        output += `${i + 1}. ${rec}\n`;
      });
      output += '\n';
    } else {
      output += `✅ No performance issues detected\n\n`;
    }
  }

  // Best practices
  if (checkBestPractices) {
    output += `## Best Practices Check\n\n`;

    const checks = [];

    // Check for "use client"
    if (code.includes('"use client"') || code.includes("'use client'")) {
      checks.push({ rule: 'Next.js "use client" directive', passed: true });
    } else {
      checks.push({
        rule: 'Next.js "use client" directive',
        passed: false,
        message: 'Add "use client"; for Next.js App Router compatibility',
      });
    }

    // Check imports
    if (code.includes('zerojin/components')) {
      checks.push({ rule: 'Correct import path', passed: true });
    } else {
      checks.push({
        rule: 'Correct import path',
        passed: false,
        message: 'Import from "zerojin/components"',
      });
    }

    // Check for reasonable dimensions
    if (layout.width >= 400 && layout.height >= 300) {
      checks.push({ rule: 'Reasonable container dimensions', passed: true });
    } else {
      checks.push({
        rule: 'Reasonable container dimensions',
        passed: false,
        message: 'Container should be at least 400x300px',
      });
    }

    checks.forEach((check) => {
      const icon = check.passed ? '✅' : '❌';
      output += `${icon} ${check.rule}\n`;
      if (!check.passed && check.message) {
        output += `   - ${check.message}\n`;
      }
    });
    output += '\n';
  }

  // Validation
  const validator = new Validator();
  const validation = validator.validate(layout, true);

  if (validation.errors.length > 0 || validation.warnings.length > 0) {
    output += `## Issues\n\n`;

    if (validation.errors.length > 0) {
      output += `**Errors:**\n\n`;
      validation.errors.forEach((err, i) => {
        output += `${i + 1}. [${err.type}] ${err.message}\n`;
      });
      output += '\n';
    }

    if (validation.warnings.length > 0) {
      output += `**Warnings:**\n\n`;
      validation.warnings.forEach((warn, i) => {
        output += `${i + 1}. ${warn.message}\n`;
      });
      output += '\n';
    }
  }

  // Refactoring opportunities
  output += `## Refactoring Opportunities\n\n`;

  const opportunities = findRefactoringOpportunities(layout);
  if (opportunities.length > 0) {
    opportunities.forEach((opp, i) => {
      output += `${i + 1}. **${opp.description}** (${opp.impact})\n`;
      if (opp.example) {
        output += `\`\`\`\n${opp.example}\n\`\`\`\n`;
      }
    });
  } else {
    output += `✅ No obvious refactoring opportunities\n`;
  }

  return {
    content: [{ type: 'text' as const, text: output }],
  };
}

function findRefactoringOpportunities(layout: any) {
  const opportunities: Array<{
    description: string;
    impact: 'high' | 'medium' | 'low';
    example?: string;
  }> = [];

  const metadata = LayoutAnalyzer.calculateMetadata(layout);

  if (metadata.maxDepth > 5) {
    opportunities.push({
      description: 'Deep nesting detected - consider flattening structure',
      impact: 'high',
    });
  }

  if (metadata.itemCount > 30) {
    opportunities.push({
      description: 'High item count - consider lazy loading or pagination',
      impact: 'medium',
    });
  }

  return opportunities;
}
