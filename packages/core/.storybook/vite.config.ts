import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const src = (file: string) => fileURLToPath(new URL(`../src/${file}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Relative paths: the built Storybook works from any host or folder
  base: './',
  resolve: {
    // The introduction's pieces (site/shell) import core by name: the source,
    // so there's one copy of every context (the mood, the mark)
    alias: [
      { find: /^@rnine\/core$/, replacement: src('index.ts') },
      { find: /^@rnine\/core\/motion$/, replacement: src('motion.ts') },
      { find: /^@rnine\/core\/kit$/, replacement: src('kit.ts') },
    ],
  },
});
