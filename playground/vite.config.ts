import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react()],
    root: path.resolve(__dirname),
    resolve: {
        alias: {
            'zerojin/hooks': path.resolve(__dirname, '../src/hooks'),
            'zerojin/components': path.resolve(__dirname, '../src/components'),
            zerojin: path.resolve(__dirname, '../src'),
        },
    },
    server: {
        port: 3000,
        open: true,
    },
});
