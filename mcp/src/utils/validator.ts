import type {
  LayoutTree,
  LayoutNode,
  ValidationError,
  ValidationWarning,
} from '../types/layout.js';
import { LayoutAnalyzer } from './layout-analyzer.js';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

/**
 * Validates DndGrid layout structure and constraints
 */
export class Validator {
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];
  private suggestions: string[] = [];

  /**
   * Validate a layout tree
   */
  validate(layout: LayoutTree, strict: boolean = false): ValidationResult {
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];

    // Validate container dimensions
    this.validateContainer(layout);

    // Validate tree structure
    this.validateNode(layout.child);

    // Strict mode validations
    if (strict) {
      this.validatePerformance(layout);
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      suggestions: this.suggestions,
    };
  }

  /**
   * Validate container properties
   */
  private validateContainer(layout: LayoutTree): void {
    if (layout.width <= 0) {
      this.errors.push({
        type: 'constraint',
        message: `Invalid container width: ${layout.width}. Must be positive.`,
        fix: 'width={1200}',
      });
    }

    if (layout.height <= 0) {
      this.errors.push({
        type: 'constraint',
        message: `Invalid container height: ${layout.height}. Must be positive.`,
        fix: 'height={800}',
      });
    }

    if (layout.width < 100 || layout.height < 100) {
      this.warnings.push({
        message: `Very small container dimensions (${layout.width}x${layout.height}). Consider larger sizes.`,
        suggestion: 'Minimum recommended: 400x300',
      });
    }
  }

  /**
   * Validate a layout node
   */
  private validateNode(node: LayoutNode, depth: number = 1): void {
    if (node.type === 'split') {
      this.validateSplit(node, depth);
      this.validateNode(node.primary, depth + 1);
      this.validateNode(node.secondary, depth + 1);
    } else {
      this.validateItem(node, depth);
    }
  }

  /**
   * Validate Split node
   */
  private validateSplit(node: LayoutNode, depth: number): void {
    if (node.type !== 'split') return;

    // Validate ratio
    if (node.ratio <= 0 || node.ratio >= 1) {
      this.errors.push({
        type: 'constraint',
        message: `Invalid split ratio: ${node.ratio}. Must be between 0 and 1 (exclusive).`,
        fix: 'ratio={0.5}',
      });
    }

    // Warn about extreme ratios
    if (node.ratio < 0.1 || node.ratio > 0.9) {
      this.warnings.push({
        message: `Extreme split ratio: ${node.ratio}. This creates very small panels.`,
        suggestion: 'Consider ratios between 0.2 and 0.8 for better UX',
      });
    }

    // Validate direction
    if (node.direction !== 'horizontal' && node.direction !== 'vertical') {
      this.errors.push({
        type: 'constraint',
        message: `Invalid direction: ${node.direction}. Must be 'horizontal' or 'vertical'.`,
        fix: 'direction="horizontal"',
      });
    }

    // Check if both children exist
    if (!node.primary || !node.secondary) {
      this.errors.push({
        type: 'structure',
        message: 'Split must have exactly 2 children (primary and secondary).',
      });
    }

    // Warn about deep nesting
    if (depth > 5) {
      this.warnings.push({
        message: `Deep nesting detected (depth: ${depth}). This may impact performance.`,
        suggestion: 'Consider flattening the layout structure',
      });
    }
  }

  /**
   * Validate Item node
   */
  private validateItem(node: LayoutNode, depth: number): void {
    if (node.type !== 'item') return;

    // Validate component name
    if (!node.component || node.component.trim().length === 0) {
      this.errors.push({
        type: 'structure',
        message: 'Item must have a component name.',
        fix: '<ComponentName />',
      });
    }

    // Check component naming convention
    if (node.component && !/^[A-Z]/.test(node.component)) {
      this.warnings.push({
        message: `Component name "${node.component}" should start with uppercase letter.`,
        suggestion: `Use "${node.component.charAt(0).toUpperCase() + node.component.slice(1)}"`,
      });
    }
  }

  /**
   * Validate performance constraints (strict mode)
   */
  private validatePerformance(layout: LayoutTree): void {
    const metadata = LayoutAnalyzer.calculateMetadata(layout);

    // Check item count
    if (metadata.itemCount > 50) {
      this.errors.push({
        type: 'constraint',
        message: `Too many items: ${metadata.itemCount}. Maximum recommended: 50`,
      });
    } else if (metadata.itemCount > 20) {
      this.warnings.push({
        message: `High item count: ${metadata.itemCount}. Consider reducing for better performance.`,
        suggestion: 'Recommended: < 20 items',
      });
    }

    // Check depth
    if (metadata.maxDepth > 6) {
      this.errors.push({
        type: 'constraint',
        message: `Tree too deep: ${metadata.maxDepth} levels. Maximum recommended: 6`,
      });
    } else if (metadata.maxDepth > 4) {
      this.warnings.push({
        message: `Deep tree structure: ${metadata.maxDepth} levels.`,
        suggestion: 'Recommended: < 4 levels for optimal performance',
      });
    }

    // Add performance suggestions
    if (metadata.estimatedPerformance === 'fair' || metadata.estimatedPerformance === 'poor') {
      this.suggestions.push(
        `Performance score: ${metadata.estimatedPerformance}. Consider simplifying the layout.`
      );
    }

    // Check for optimization opportunities
    if (metadata.splitCount > metadata.itemCount) {
      this.suggestions.push(
        'More splits than items detected. Some splits may be unnecessary.'
      );
    }
  }

  /**
   * Validate code string (wrapper for AST parsing)
   */
  validateCode(code: string, strict: boolean = false): ValidationResult {
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];

    // Check for "use client" directive (Next.js)
    if (!code.includes('"use client"') && !code.includes("'use client'")) {
      this.warnings.push({
        message: 'Missing "use client" directive for Next.js App Router.',
        suggestion: 'Add "use client"; at the top of the file',
      });
    }

    // Check for required imports
    if (!code.includes('DndGridContainer')) {
      this.errors.push({
        type: 'structure',
        message: 'Missing DndGridContainer import.',
        fix: "import { DndGridContainer } from 'zerojin/components';",
      });
    }

    // Basic syntax checks
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      this.errors.push({
        type: 'syntax',
        message: `Mismatched braces: ${openBraces} opening, ${closeBraces} closing.`,
      });
    }

    const openTags = (code.match(/<(?!\/)[A-Z]/g) || []).length;
    const closeTags = (code.match(/<\/[A-Z]/g) || []).length;
    if (openTags !== closeTags) {
      this.errors.push({
        type: 'syntax',
        message: `Mismatched JSX tags: ${openTags} opening, ${closeTags} closing.`,
      });
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      suggestions: this.suggestions,
    };
  }
}
