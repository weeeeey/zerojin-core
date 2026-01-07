# MCP Gemini Server for DndGrid

This MCP server provides real-time access to the DndGrid project documentation and source code, allowing AI agents to always reference the latest version of the files.

## Features

- **Real-time Documentation Sync**: Directly reads markdown files and source code from the project.
- **Resources**:
    - `dndgrid://docs/troubleshooting`: Detailed troubleshooting guide.
    - `dndgrid://docs/api/container`: `DndGridContainer` source code.
    - `dndgrid://docs/api/item`: `DndGridItem` source code.
    - `dndgrid://package-json`: Project `package.json`.

## Prerequisities

- Node.js >= 18
- NPM

## Installation & Build

```bash
cd mcp-gemini
npm install
npm run build
```

## Usage with Claude Desktop

1.  Open your Claude Desktop configuration file:
    -   macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
    -   Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2.  Add the following configuration (adjust the path if you moved the project):

```json
{
  "mcpServers": {
    "dnd-grid-gemini": {
      "command": "node",
      "args": [
        "/Users/zero/Desktop/zerojin-core/mcp-gemini/dist/index.js"
      ]
    }
  }
}
```

3.  Restart Claude Desktop.

## Testing

You can test the server locally using the provided test script:

```bash
node test-server.js
```
