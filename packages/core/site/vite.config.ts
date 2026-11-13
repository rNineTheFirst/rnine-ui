// Core's brand kit: the theme picker and the contract every theme keeps (site/kit),
// built to site/dist. Each theme's kit sits next to it at ./<id>/ when hosted.
//
//   yarn workspace @rnine/core build-kit     (after `build`: it reads dist/tokens)
//   yarn workspace @rnine/core dev-kit
import { defineConfig } from 'vite';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineKit, storyEntries } from './kit-config';

const pkg = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig(
  defineKit({
    pkg,
    root: fileURLToPath(new URL('./kit', import.meta.url)),
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    port: 5176,
    define: { __STORIES__: storyEntries(join(pkg, 'src')).sort((a, b) => a.title.localeCompare(b.title)) },
  }),
);
