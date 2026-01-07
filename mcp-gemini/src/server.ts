import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ProjectFileReader } from './utils/file-reader.js';

export class DndGridMCPServer {
  private server: Server;
  private fileReader: ProjectFileReader;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-gemini',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.fileReader = new ProjectFileReader();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // ---------------------------------------------------------
    // Resources Handler (Step 1: Document Sync)
    // ---------------------------------------------------------
    
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'dndgrid://docs/troubleshooting',
            name: 'DndGrid Troubleshooting',
            description: 'Real-time troubleshooting guide from source',
            mimeType: 'text/markdown',
          },
          {
            uri: 'dndgrid://docs/api/container',
            name: 'DndGridContainer Source',
            description: 'Source code for DndGridContainer',
            mimeType: 'text/typescript',
          },
           {
            uri: 'dndgrid://docs/api/item',
            name: 'DndGridItem Source',
            description: 'Source code for DndGridItem',
            mimeType: 'text/typescript',
          },
          {
            uri: 'dndgrid://package-json',
            name: 'Root Package JSON',
            description: 'Project configuration and dependencies',
            mimeType: 'application/json',
          },
        ],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        if (uri === 'dndgrid://docs/troubleshooting') {
          const content = await this.fileReader.readFile('src/components/dnd-grid/troubleShooting.md');
          return {
            contents: [{ uri, mimeType: 'text/markdown', text: content }],
          };
        }
        
        if (uri === 'dndgrid://docs/api/container') {
          const content = await this.fileReader.readFile('src/components/dnd-grid/container.tsx');
          return {
             contents: [{ uri, mimeType: 'text/typescript', text: content }],
          };
        }

        if (uri === 'dndgrid://docs/api/item') {
            const content = await this.fileReader.readFile('src/components/dnd-grid/item.tsx');
            return {
               contents: [{ uri, mimeType: 'text/typescript', text: content }],
            };
          }

        if (uri === 'dndgrid://package-json') {
          const content = await this.fileReader.readFile('package.json');
          return {
            contents: [{ uri, mimeType: 'application/json', text: content }],
          };
        }

        throw new Error(`Resource not found: ${uri}`);
      } catch (error) {
        throw new Error(`Failed to read resource: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    // ---------------------------------------------------------
    // Tools Handler (Placeholder for future steps)
    // ---------------------------------------------------------
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: []
        };
    });
    
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        throw new Error(`Tool not implemented: ${request.params.name}`);
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('DndGrid MCP Gemini Server started');
  }
}
