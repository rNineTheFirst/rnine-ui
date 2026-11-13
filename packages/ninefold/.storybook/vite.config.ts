import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const core = (file: string) => fileURLToPath(new URL(`../../core/src/${file}`, import.meta.url));
const own = (file: string) => fileURLToPath(new URL(`../src/${file}`, import.meta.url));
const slash = (p: string) => p.replace(/\\/g, '/').toLowerCase();

// Core's stories show core's components; where Ninefold restyles one, the
// stories get Ninefold's. Only the stories: Ninefold's own versions wrap core's.
const RESTYLED: [string, string][] = [
  ['components/Card/Card', 'components/Card/Card.tsx'],
  ['components/Button/Button', 'components/Button/Button.tsx'],
  ['motion/TiltCard', 'components/Card/TiltCard.tsx'],
  ['motion/Magnet', 'components/Magnet/Magnet.tsx'],
  ['motion/Mark', 'motion/Mark.tsx'],
  ['motion/Backdrop', 'motion/Backdrop.tsx'],
  ['motion/TextReveal', 'motion/TextReveal.tsx'],
];

function restyledInCoreStories(): Plugin {
  const coreSrc = slash(core(''));
  return {
    name: 'ninefold-restyled-core-stories',
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
  // Relative paths: the built Storybook works from any host or folder (it's served at /ninefold/)
  base: './',
  resolve: {
    // Core's stories import its source, so Ninefold uses core's source too:
    // one copy of every context (the theme's effects, the mood, the mark)
    alias: [
      { find: /^@rnine\/core$/, replacement: core('index.ts') },
      { find: /^@rnine\/core\/motion$/, replacement: core('motion.ts') },
      { find: /^@rnine\/core\/kit$/, replacement: core('kit.ts') },
    ],
  },
});
