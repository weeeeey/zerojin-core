import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
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
          prompts: {},
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

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'drop-indicator-customization',
            description: 'DndGrid에서 드래그 시 나타나는 drop indicator의 색상, 스타일, 애니메이션을 커스터마이징하는 방법',
            arguments: [
              {
                name: 'style-type',
                description: '커스터마이징 타입: color (색상), animation (애니메이션), border (테두리), shadow (그림자)',
                required: false,
              },
              {
                name: 'theme',
                description: '테마: light (밝은 테마), dark (어두운 테마), custom (커스텀)',
                required: false,
              },
            ],
          },
          {
            name: 'drop-indicator-quadrants',
            description: '상단, 좌측, 우측, 하단 사분면에 각각 다른 스타일을 적용하는 방법',
            arguments: [
              {
                name: 'quadrant',
                description: '사분면: top (상단), left (좌측), right (우측), bottom (하단), all (전체)',
                required: false,
              },
            ],
          },
          {
            name: 'drop-indicator-accessibility',
            description: '색각 이상자와 스크린 리더 사용자를 위한 접근 가능한 drop indicator 구현',
            arguments: [],
          },
        ],
      };
    });

    // Handle specific prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'drop-indicator-customization') {
        const styleType = args?.['style-type'] || 'general';
        const theme = args?.theme || 'light';

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `DndGrid에서 드롭 시 나타나는 표시 효과를 ${styleType} 스타일로 ${theme} 테마에 맞춰 커스터마이징하고 싶어요`,
              },
            },
            {
              role: 'assistant',
              content: {
                type: 'text',
                text: this.getDropIndicatorCustomizationGuide(styleType, theme),
              },
            },
          ],
        };
      }

      if (name === 'drop-indicator-quadrants') {
        const quadrant = args?.quadrant || 'all';

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `${quadrant === 'all' ? '모든' : quadrant} 사분면의 drop indicator 스타일을 변경하고 싶어요`,
              },
            },
            {
              role: 'assistant',
              content: {
                type: 'text',
                text: this.getQuadrantStyleGuide(quadrant),
              },
            },
          ],
        };
      }

      if (name === 'drop-indicator-accessibility') {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: 'Drop indicator를 접근 가능하게 만들려면 어떻게 해야 하나요?',
              },
            },
            {
              role: 'assistant',
              content: {
                type: 'text',
                text: this.getAccessibilityGuide(),
              },
            },
          ],
        };
      }

      throw new Error(`Unknown prompt: ${name}`);
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

### ItemDrag (필수)

**DndGrid v2.0+ 필수 요구사항**

모든 드래그 가능한 아이템은 ItemDrag로 감싸야 합니다:

\`\`\`tsx
<DndGridItem>
  <ItemDrag>
    <DndGridItemContent>
      <YourComponent />
    </DndGridItemContent>
  </ItemDrag>
</DndGridItem>
\`\`\`

- ItemDrag는 드래그 인터랙션을 처리합니다
- 커스텀 헤더가 필요한 경우 수동으로 children 추가 가능

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

## 컴포넌트 구조

### ItemDrag 필수 사용

✅ **올바른 구조**:
\`\`\`tsx
<DndGridItem>
  <ItemDrag>
    <DndGridItemContent>
      <Component />
    </DndGridItemContent>
  </ItemDrag>
</DndGridItem>
\`\`\`

❌ **잘못된 구조** (드래그 작동 안 함):
\`\`\`tsx
<DndGridItem>
  <DndGridItemContent>
    <Component />
  </DndGridItemContent>
</DndGridItem>
\`\`\`

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
   * Get drop indicator customization guide
   */
  private getDropIndicatorCustomizationGuide(
    styleType: string,
    theme: string
  ): string {
    const guides: Record<string, string> = {
      color: `# Drop Indicator 색상 커스터마이징

## ${theme === 'dark' ? '다크' : '라이트'} 테마용 색상

\`\`\`css
/* ${theme} 테마 */
.dnd-grid-item[data-drop-quadrant="top"] {
    box-shadow: inset 0 10px 10px -5px ${
      theme === 'dark' ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.4)'
    };
}

.dnd-grid-item[data-drop-quadrant="left"] {
    box-shadow: inset 10px 0 10px -5px ${
      theme === 'dark' ? 'rgba(52, 211, 153, 0.5)' : 'rgba(34, 197, 94, 0.4)'
    };
}
\`\`\`

## 컴포넌트 사용
\`\`\`tsx
<DndGridItem>
  {children}
</DndGridItem>
\`\`\`

위 CSS를 글로벌 스타일시트에 추가하면 자동으로 적용됩니다.`,

      animation: `# Drop Indicator 애니메이션

## 펄스 효과
\`\`\`css
@keyframes drop-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.dnd-grid-item[data-drop-quadrant] {
    animation: drop-pulse 1.5s ease-in-out infinite;
}
\`\`\`

## 슬라이드 효과
\`\`\`css
.dnd-grid-item[data-drop-quadrant="top"] {
    transition: box-shadow 200ms ease-out;
}
\`\`\`

## 글로우 효과
\`\`\`css
.dnd-grid-item[data-drop-quadrant] {
    box-shadow:
        inset 0 10px 10px -5px rgba(59, 130, 246, 0.3),
        0 0 20px rgba(59, 130, 246, 0.4);
}
\`\`\``,

      border: `# Drop Indicator 테두리 스타일

## 두꺼운 테두리
\`\`\`css
.dnd-grid-item[data-drop-quadrant="top"] {
    border-top: 4px solid #3b82f6;
    box-shadow: none;
}
\`\`\`

## 점선 테두리
\`\`\`css
.dnd-grid-item[data-drop-quadrant="left"] {
    border-left: 3px dashed #10b981;
    box-shadow: none;
}
\`\`\`

## 그라디언트 테두리
\`\`\`css
.dnd-grid-item[data-drop-quadrant="top"] {
    border-top: 3px solid;
    border-image: linear-gradient(to right, #3b82f6, #8b5cf6) 1;
    box-shadow: none;
}
\`\`\``,

      shadow: `# Drop Indicator 그림자 효과

## 부드러운 그림자
\`\`\`css
.dnd-grid-item[data-drop-quadrant="top"] {
    box-shadow: inset 0 15px 20px -10px rgba(0, 0, 0, 0.2);
}
\`\`\`

## 강조된 그림자
\`\`\`css
.dnd-grid-item[data-drop-quadrant] {
    box-shadow:
        inset 0 10px 10px -5px rgba(0, 0, 0, 0.4),
        inset 0 0 0 2px rgba(59, 130, 246, 0.3);
}
\`\`\``,
    };

    return (
      guides[styleType] ||
      `# Drop Indicator 커스터마이징

## 기본 방법

DndGrid는 \`data-drop-quadrant\` attribute를 사용합니다:

\`\`\`css
.dnd-grid-item[data-drop-quadrant="top"] {
    /* 상단 사분면 스타일 */
}

.dnd-grid-item[data-drop-quadrant="left"] {
    /* 좌측 사분면 스타일 */
}

.dnd-grid-item[data-drop-quadrant="right"] {
    /* 우측 사분면 스타일 */
}

.dnd-grid-item[data-drop-quadrant="bottom"] {
    /* 하단 사분면 스타일 */
}
\`\`\`

## Props를 통한 커스터마이징

\`\`\`tsx
<DndGridItem dropIndicatorClassName="custom-drop">
  {children}
</DndGridItem>
\`\`\`

상세 가이드는 /docs/api/components/dnd-grid.md를 참고하세요.`
    );
  }

  /**
   * Get quadrant-specific styling guide
   */
  private getQuadrantStyleGuide(quadrant: string): string {
    const quadrantGuides: Record<string, string> = {
      top: `# 상단 사분면 스타일링

\`\`\`css
.dnd-grid-item[data-drop-quadrant="top"] {
    box-shadow: inset 0 10px 10px -5px rgba(59, 130, 246, 0.4);
    border-top: 2px solid #3b82f6;
}
\`\`\``,

      left: `# 좌측 사분면 스타일링

\`\`\`css
.dnd-grid-item[data-drop-quadrant="left"] {
    box-shadow: inset 10px 0 10px -5px rgba(34, 197, 94, 0.4);
    border-left: 2px solid #10b981;
}
\`\`\``,

      right: `# 우측 사분면 스타일링

\`\`\`css
.dnd-grid-item[data-drop-quadrant="right"] {
    box-shadow: inset -10px 0 10px -5px rgba(239, 68, 68, 0.4);
    border-right: 2px solid #ef4444;
}
\`\`\``,

      bottom: `# 하단 사분면 스타일링

\`\`\`css
.dnd-grid-item[data-drop-quadrant="bottom"] {
    box-shadow: inset 0 -10px 10px -5px rgba(245, 158, 11, 0.4);
    border-bottom: 2px solid #f59e0b;
}
\`\`\``,

      all: `# 모든 사분면 스타일링

\`\`\`css
/* 공통 스타일 */
.dnd-grid-item[data-drop-quadrant] {
    transition: all 200ms ease-out;
}

/* 사분면별 색상 */
.dnd-grid-item[data-drop-quadrant="top"] {
    box-shadow: inset 0 10px 10px -5px rgba(59, 130, 246, 0.4);
}

.dnd-grid-item[data-drop-quadrant="left"] {
    box-shadow: inset 10px 0 10px -5px rgba(34, 197, 94, 0.4);
}

.dnd-grid-item[data-drop-quadrant="right"] {
    box-shadow: inset -10px 0 10px -5px rgba(239, 68, 68, 0.4);
}

.dnd-grid-item[data-drop-quadrant="bottom"] {
    box-shadow: inset 0 -10px 10px -5px rgba(245, 158, 11, 0.4);
}
\`\`\``,
    };

    return quadrantGuides[quadrant] || quadrantGuides.all;
  }

  /**
   * Get accessibility guidelines for drop indicators
   */
  private getAccessibilityGuide(): string {
    return `# Drop Indicator 접근성 가이드

## 1. 색상만 의존하지 않기

색각 이상자를 위해 색상 + 패턴 조합:

\`\`\`css
.dnd-grid-item[data-drop-quadrant="top"] {
    box-shadow: inset 0 10px 10px -5px rgba(59, 130, 246, 0.4);
    background-image: repeating-linear-gradient(
        90deg,
        transparent,
        transparent 8px,
        rgba(59, 130, 246, 0.15) 8px,
        rgba(59, 130, 246, 0.15) 16px
    );
}
\`\`\`

## 2. 충분한 명암비

WCAG AA 기준 (4.5:1) 이상:

\`\`\`css
/* ✅ 좋은 예 */
.dnd-grid-item[data-drop-quadrant] {
    border: 2px solid #1e40af; /* 명암비 8:1 */
}

/* ❌ 나쁜 예 */
.dnd-grid-item[data-drop-quadrant] {
    border: 1px solid #e5e7eb; /* 명암비 1.2:1 */
}
\`\`\`

## 3. 애니메이션 제한

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  .dnd-grid-item[data-drop-quadrant] {
    animation: none;
    transition: none;
  }
}
\`\`\`

## 4. 시각적 + 텍스트 피드백

\`\`\`tsx
<DndGridItem
    aria-label={
        isDragging
            ? "드래그 중: 위치를 선택하세요"
            : "드래그 가능한 항목"
    }
>
    {children}
</DndGridItem>
\`\`\`

## 5. 키보드 접근성

드래그 앤 드롭은 마우스 전용이 아니어야 합니다. 키보드로도 작동하도록 구현하세요.

자세한 내용은 WCAG 2.1 가이드라인을 참고하세요:
https://www.w3.org/WAI/WCAG21/quickref/`;
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
