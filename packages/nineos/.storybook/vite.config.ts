import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const core = (file: string) => fileURLToPath(new URL(`../../core/src/${file}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Relative paths: the built Storybook works from any host or folder
  base: './',
  resolve: {
    // Core's stories import its source, so NineOS uses core's source too:
    // one copy of every context (the theme's effects, the mood, the mark)
    alias: [
      { find: /^@rnine\/core$/, replacement: core('index.ts') },
      { find: /^@rnine\/core\/motion$/, replacement: core('motion.ts') },
      { find: /^@rnine\/core\/kit$/, replacement: core('kit.ts') },
    ],
  },
});
