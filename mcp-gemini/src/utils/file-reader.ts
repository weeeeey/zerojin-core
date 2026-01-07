import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Get current directory path (compatible with ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is 2 levels up from mcp-gemini/src (assuming compiled code structure or direct execution)
// If running from mcp-gemini/src/server.ts, project root is ../../
// But we should verify this logic depending on where 'mcp-gemini' is located.
// User said mcp-gemini is in project root.
// So relative to mcp-gemini folder, the project root is '..'.

export class ProjectFileReader {
    private projectRoot: string;

    constructor() {
        // mcp-gemini is at the root of the project.
        // We need to resolve the path relative to the current working directory or this file location.
        // Assuming the server is started from mcp-gemini directory or via npm script inside it.
        // Let's rely on process.cwd() if started from mcp-gemini folder, or resolve relative to this file.
        
        // Strategy: Assume this code runs inside mcp-gemini/dist/ or mcp-gemini/src/
        // The project root contains mcp-gemini, src, docs, etc.
        // So we need to go up from mcp-gemini.
        
        this.projectRoot = path.resolve(process.cwd(), '..');
        
        // Verify we are in the right place by checking if package.json exists in root
        // This is a simple check.
    }

    async readFile(relativePath: string): Promise<string> {
        const fullPath = path.join(this.projectRoot, relativePath);
        try {
            return await fs.readFile(fullPath, 'utf-8');
        } catch (error) {
            throw new Error(`Failed to read file at ${fullPath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async getProjectRoot(): Promise<string> {
        return this.projectRoot;
    }
}
