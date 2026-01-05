import { DndGridMCPServer } from './server.js';

/**
 * Main entry point for DndGrid MCP Server
 */
async function main() {
  try {
    const server = new DndGridMCPServer();
    await server.start();
  } catch (error) {
    console.error('Failed to start DndGrid MCP Server:', error);
    process.exit(1);
  }
}

main();
