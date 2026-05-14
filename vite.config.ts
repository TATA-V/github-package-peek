import { defineConfig, build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import babel from '@rolldown/plugin-babel';
import { resolve } from 'node:path';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';

const isWatch = process.argv.includes('--watch');

export default defineConfig({
  plugins: [
    babel({ plugins: ['babel-plugin-react-compiler'] }),
    react(),
    tailwindcss(),
    {
      name: 'build-extension-scripts',
      async closeBundle() {
        await build({
          configFile: false,
          build: {
            outDir: 'dist',
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname, 'src/content/content.ts'),
              name: 'content',
              formats: ['iife'],
              fileName: () => 'content.js',
            },
            rollupOptions: { output: { inlineDynamicImports: true } },
          },
        });
        await build({
          configFile: false,
          build: {
            outDir: 'dist',
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname, 'src/background/background.ts'),
              name: 'background',
              formats: ['iife'],
              fileName: () => 'background.js',
            },
            rollupOptions: { output: { inlineDynamicImports: true } },
          },
        });
        mkdirSync('dist', { recursive: true });
        copyFileSync('manifest.json', 'dist/manifest.json');
        if (isWatch) {
          writeFileSync('dist/hot.json', JSON.stringify({ t: Date.now() }));
        }
      },
    },
  ],
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
