import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// One output file per source module, named by its path under src/. Computed
// here, case-insensitively: on Windows a module id's drive letter can differ
// in case from the config's path, and Rollup's preserveModulesRoot then
// misses and nests the output under the full path.
const SRC = fileURLToPath(new URL('./src/', import.meta.url)).replace(/\\/g, '/').toLowerCase();
function outputName(chunk: { facadeModuleId?: string | null }) {
  const id = (chunk.facadeModuleId ?? '').replace(/\\/g, '/');
  const bare = (path: string) => `${path.replace(/\.[^./]+$/, '')}.js`;
  if (id.toLowerCase().startsWith(SRC)) return bare(id.slice(SRC.length));
  const nm = id.lastIndexOf('/node_modules/');
  if (nm >= 0) return bare(id.slice(nm + 1));
  return '[name].js';
}

// Library build: ES modules (one file per source module) plus NineOS's
// components' stylesheet, dist/components.css (scripts/build.mjs bundles
// dist/styles.css). @rnine/core and React stay external. dist/ also holds
// the tokens built before this, so it isn't emptied.
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // Readable and collision-free: r9-Button_primary_x7k2a
      generateScopedName: 'r9-[name]_[local]_[hash:base64:5]',
    },
  },
  build: {
    lib: {
      entry: { index: 'src/index.ts', motion: 'src/motion.ts', pages: 'src/pages.ts' },
      formats: ['es'],
      cssFileName: 'components',
    },
    cssCodeSplit: false,
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      // @rnine/nineos/tokens: the pages entry's own tokens (a self-reference, resolved where it runs)
      external: [/^@rnine\/core($|\/)/, /^@rnine\/nineos\/tokens$/,/^react($|\/)/, /^react-dom($|\/)/, /^lucide-react($|\/)/, /^dompurify($|\/)/],
      output: {
        preserveModules: true,
        entryFileNames: outputName,
      },
    },
  },
});
