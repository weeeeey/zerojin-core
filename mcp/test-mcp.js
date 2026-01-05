import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

async function test() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["/Users/zero/Desktop/zerojin-core/mcp/dist/index.cjs"],
  });

  const client = new Client({
    name: "test-client",
    version: "1.0.0",
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  console.log("Connected to server");

  const tools = await client.listTools();
  console.log("Tools:", JSON.stringify(tools, null, 2));

  await transport.close();
}

test().catch(console.error);
