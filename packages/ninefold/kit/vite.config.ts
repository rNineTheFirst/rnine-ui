// Ninefold's brand kit: one page (kit/) built to kit/dist with relative paths,
// on the brand kit shell every library's kit shares (core/site). Hosted next to
// core's kit, at ./ninefold/.
//
//   yarn workspace @rnine/ninefold build-kit     (after `build`: it reads dist/tokens)
//   yarn workspace @rnine/ninefold dev-kit
import { defineConfig } from 'vite';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { defineKit } from '../../core/site/kit-config';
import { loadSite } from '../../core/site/themes.mjs';
import { sealSvg } from '../src/motion/seal';
import { BOOK_MARK } from '../src/example/book';

const pkg = fileURLToPath(new URL('..', import.meta.url));
const src = (file: string) => join(pkg, 'src', file);

/** The seal in a mood's colors, with Ninefold's monogram (or the sample book) as the mark to replace. */
async function seal(scheme: 'light' | 'dark') {
  const { tokens } = await import(pathToFileURL(join(pkg, 'dist', 'tokens.js')).href);
  const role = (name: string) => String(tokens.schemes[scheme].find((r: { name: string }) => r.name === name).value).slice(0, 7);
  const mark = loadSite().themes.find((t) => t.id === 'ninefold')?.monogram ?? BOOK_MARK.full;
  return sealSvg({ wax: role('wax'), waxLight: role('wax-light'), waxDark: role('wax-dark'), leaf: role('leaf') }, mark);
}

export default defineConfig(
  defineKit({
    pkg,
    library: { name: '@rnine/ninefold', index: src('index.ts'), motion: src('motion.ts') },
    port: 5177,
    downloads: {
      'downloads/seal-glint.svg': () => seal('light'),
      'downloads/seal-gloam.svg': () => seal('dark'),
    },
  }),
);
