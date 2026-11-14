import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const core = (file: string) => fileURLToPath(new URL(`../../core/src/${file}`, import.meta.url));
const own = (file: string) => fileURLToPath(new URL(`../src/${file}`, import.meta.url));
const slash = (p: string) => p.replace(/\\/g, '/').toLowerCase();

// Core's stories show core's components; where NineSync has its own version,
// the stories get NineSync's. Only the stories: NineSync's versions wrap core's.
const RESTYLED: [string, string][] = [
  ['components/Tabs/Tabs', 'components/Tabs/Tabs.tsx'],
  ['components/AppShell/SideNav', 'components/SideNav/SideNav.tsx'],
  ['components/PageHeader/PageHeader', 'components/PageHeader/PageHeader.tsx'],
  ['motion/Backdrop', 'motion/Backdrop.tsx'],
  ['motion/TextReveal', 'motion/TextReveal.tsx'],
];

function restyledInCoreStories(): Plugin {
  const coreSrc = slash(core(''));
  return {
    name: 'ninesync-restyled-core-stories',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer || !slash(importer).startsWith(coreSrc) || !importer.includes('.stories.')) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!resolved) return null;
      const id = slash(resolved.id).replace(/\.tsx?$/, '');
      const hit = RESTYLED.find(([from]) => id === slash(core(from)));
      return hit ? own(hit[1]) : null;
    },
  };
}

export default defineConfig({
  plugins: [restyledInCoreStories(), react()],
  // Relative paths: the built Storybook works from any host or folder (it's served at /ninesync/)
  base: './',
  css: {
    modules: {
      // Core's class names as the library build has them: NineSync's look
      // (src/look.scss) finds core's components by these names
      generateScopedName: 'r9-[name]_[local]_[hash:base64:5]',
    },
  },
  resolve: {
    // Core's stories import its source, so NineSync uses core's source too:
    // one copy of every context (the theme's effects, the mood, the mark)
    alias: [
      { find: /^@rnine\/core$/, replacement: core('index.ts') },
      { find: /^@rnine\/core\/motion$/, replacement: core('motion.ts') },
      { find: /^@rnine\/core\/kit$/, replacement: core('kit.ts') },
    ],
  },
});
