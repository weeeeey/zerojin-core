import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.join(__dirname, 'dist', 'index.js');

console.log(`Testing MCP Server at: ${serverPath}`);

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'inherit'], // stdin, stdout, stderr
});

const requests = [
  // 1. Initialize
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0',
      },
    },
  },
  // 2. List Resources
  {
    jsonrpc: '2.0',
    id: 2,
    method: 'resources/list',
  },
  // 3. Read Resource (Troubleshooting)
  {
    jsonrpc: '2.0',
    id: 3,
    method: 'resources/read',
    params: {
      uri: 'dndgrid://docs/troubleshooting',
    },
  },
];

let buffer = '';

server.stdout.on('data', (data) => {
  buffer += data.toString();
  
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // Keep incomplete line in buffer

  for (const line of lines) {
    if (!line.trim()) continue;
    
    try {
      const response = JSON.parse(line);
      console.log('Received response for ID:', response.id);
      
      if (response.id === 1) {
        console.log('✅ Initialization successful');
        // Send next request
        sendRequest(requests[1]);
      } else if (response.id === 2) {
        console.log('✅ List Resources successful');
        console.log('Resources:', response.result.resources.map((r) => r.uri));
        // Send next request
        sendRequest(requests[2]);
      } else if (response.id === 3) {
        console.log('✅ Read Resource successful');
        const content = response.result.contents[0].text;
        console.log('Content preview:', content.substring(0, 50) + '...');
        
        // Clean exit
        process.exit(0);
      }
    } catch (e) {
      console.error('Failed to parse JSON:', line);
    }
  }
});

function sendRequest(req) {
  const json = JSON.stringify(req);
  server.stdin.write(json + '\n');
}

// Start sequence
sendRequest(requests[0]);

// Timeout
setTimeout(() => {
  console.error('❌ Timeout');
  server.kill();
  process.exit(1);
}, 5000);