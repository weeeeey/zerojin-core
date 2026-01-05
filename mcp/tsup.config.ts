import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['@modelcontextprotocol/sdk'],
  outDir: 'dist',
  target: 'node18',
  shims: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
