import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        'hooks/index': 'src/hooks/index.ts',
        'components/index': 'src/components/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
    treeshake: true,
    splitting: false,
    minify: false,
    esbuildOptions(options) {
        options.banner = {
            js: '"use client";',
        };
    },
});
