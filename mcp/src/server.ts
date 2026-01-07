import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  validateLayout,
  ValidateLayoutInputSchema,
} from './tools/validate-layout.js';
import {
  analyzeLayout,
  AnalyzeLayoutInputSchema,
} from './tools/analyze-layout.js';
import {
  applyTemplate,
  ApplyTemplateInputSchema,
} from './tools/apply-template.js';
import {
  generateLayout,
  GenerateLayoutInputSchema,
} from './tools/generate-layout.js';
import {
  interactiveBuilder,
  InteractiveBuilderInputSchema,
} from './tools/interactive-builder.js';

import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * DndGrid MCP Server
 * Provides tools and resources for generating and analyzing DndGrid layouts
 */
export class DndGridMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'dndgrid-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error('ListToolsRequest received');
      return {
        tools: [
          {
            name: 'validate-layout',
            description: 'Validate DndGrid layout structure and constraints',
            inputSchema: zodToJsonSchema(ValidateLayoutInputSchema) as any,
          },
          {
            name: 'analyze-layout',
            description: 'Analyze existing DndGrid code and suggest improvements',
            inputSchema: zodToJsonSchema(AnalyzeLayoutInputSchema) as any,
          },
          {
            name: 'apply-template',
            description: 'Apply a pre-defined layout template. width/height must be pixel numbers only (e.g., 1200, 800) - CSS units like "100vw" are NOT supported',
            inputSchema: zodToJsonSchema(ApplyTemplateInputSchema) as any,
          },
          {
            name: 'generate-layout',
            description: 'Generate DndGrid layout code from natural language requirements. containerWidth/containerHeight must be pixel numbers only (e.g., 1200, 800) - CSS units like "100vw" are NOT supported',
            inputSchema: zodToJsonSchema(GenerateLayoutInputSchema) as any,
          },
          {
            name: 'interactive-builder',
            description: 'Build layout interactively through guided steps',
            inputSchema: zodToJsonSchema(InteractiveBuilderInputSchema) as any,
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      console.error(`CallToolRequest received: ${name}`);

      try {
        switch (name) {
          case 'validate-layout':
            return await validateLayout(args as any);
          case 'analyze-layout':
            return await analyzeLayout(args as any);
          case 'apply-template':
            return await applyTemplate(args as any);
          case 'generate-layout':
            return await generateLayout(args as any);
          case 'interactive-builder':
            return await interactiveBuilder(args as any);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'dndgrid://docs/architecture',
            name: 'DndGrid Architecture',
            description: 'Complete architecture documentation',
            mimeType: 'text/markdown',
          },
          {
            uri: 'dndgrid://templates/list',
            name: 'Available Templates',
            description: 'List of all available layout templates',
            mimeType: 'application/json',
          },
          {
            uri: 'dndgrid://docs/best-practices',
            name: 'Best Practices',
            description: 'Performance and integration guidelines',
            mimeType: 'text/markdown',
          },
        ],
      };
    });

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === 'dndgrid://docs/architecture') {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: this.getArchitectureDoc(),
            },
          ],
        };
      }

      if (uri === 'dndgrid://templates/list') {
        const { BUILTIN_TEMPLATES } = await import('./types/template.js');
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(BUILTIN_TEMPLATES, null, 2),
            },
          ],
        };
      }

      if (uri === 'dndgrid://docs/best-practices') {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: this.getBestPracticesDoc(),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  /**
   * Get architecture documentation
   */
  private getArchitectureDoc(): string {
    return `# DndGrid Architecture

## Overview

DndGrid is a tree-based drag-and-drop grid system for React applications.

## Core Components

### DndGridContainer
- Root component
- Props: \`width\`, \`height\`, \`children\`
- **IMPORTANT:** \`width\` and \`height\` must be numbers in pixels (e.g., 1200, 800)
- Do NOT use CSS units like "100vw" or "100vh" - only pixel numbers are supported
- Manages global state

### DndGridSplit
- Divides space into two sections
- Props: \`direction\` ('horizontal' | 'vertical'), \`ratio\` (0-1), \`children\` (exactly 2)
- Creates nested layouts

### DndGridItem
- Leaf node containing user components
- Props: \`children\`
- Can be dragged and rearranged

## Key Concepts

### Flat Rendering
- All items rendered at same depth
- Preserves React component state during DnD
- Logical tree != rendering tree

### Tree Structure
- Binary tree: each Split has 2 children
- ID system: binary indexing
- Supports unlimited nesting (recommended < 4 levels)

### Next.js Compatibility
- Requires \`"use client"\` directive for App Router
- All DndGrid components are client components

## Performance

- **Recommended:** < 20 items, < 4 depth levels
- **Maximum:** < 50 items, < 6 depth levels
- Flat rendering optimizes reconciliation
`;
  }

  /**
   * Get best practices documentation
   */
  private getBestPracticesDoc(): string {
    return `# DndGrid Best Practices

## Container Dimensions

### CRITICAL: Use Pixel Numbers Only
- **width** and **height** props MUST be numbers in pixels (e.g., 1200, 800)
- ❌ Do NOT use CSS units like "100vw", "100vh", "100%", "calc(...)", etc.
- ✅ Use only positive integers representing pixels
- Example: \`<DndGridContainer width={1200} height={800}>\`
- The internal layout calculation logic requires numeric pixel values

## Performance

### Item Count
- Keep below 20 items for optimal performance
- Maximum 50 items

### Tree Depth
- Recommended: < 4 levels
- Maximum: 6 levels

### Split Ratios
- Avoid extreme ratios (< 0.1 or > 0.9)
- Use 0.2-0.8 range for better UX

## Next.js Integration

### App Router
\`\`\`tsx
"use client";

import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';
\`\`\`

### Pages Router
No "use client" directive needed

## Common Patterns

### IDE Layout
- Sidebar: 20%
- Editor: 56%
- Terminal: 24%

### Dashboard (2x2)
- Equal splits: 50/50

### Three Column
- Left: 20%
- Center: 60%
- Right: 20%

## Troubleshooting

### State Reset on DnD
- Cause: Server Component in Next.js App Router
- Fix: Add "use client" to all DndGrid components

### Performance Issues
- Check item count and depth
- Simplify nested structures
- Consider lazy loading
`;
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new (
      await import('@modelcontextprotocol/sdk/server/stdio.js')
    ).StdioServerTransport();
    await this.server.connect(transport);
    console.error('DndGrid MCP Server started');
  }
}
