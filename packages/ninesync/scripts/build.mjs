// Builds NineSync's CSS around the Vite library build:
//   node scripts/build.mjs           before vite: dist/tokens.*, dist/_variables.scss, dist/ninesync-base.css
//   node scripts/build.mjs --bundle  after vite:  dist/styles.css
//
// styles.css, in order: NineSync tokens, core's base.css, NineSync's own base
// (headings, <mark>, focus, its keyframes), core's components.css, NineSync's components.css.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass';
import { buildTokens } from '@rnine/core/build-tokens';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const core = dirname(createRequire(import.meta.url).resolve('@rnine/core/package.json'));
const read = (file) => readFileSync(file, 'utf8');

if (process.argv.includes('--bundle')) {
  writeFileSync(
    join(dist, 'styles.css'),
    [
      read(join(dist, 'tokens.css')),
      read(join(core, 'dist', 'base.css')),
      read(join(dist, 'ninesync-base.css')),
      read(join(core, 'dist', 'components.css')),
      read(join(dist, 'components.css')),
    ].join('\n'),
  );
  console.log('NineSync: dist/styles.css (tokens + base + core components + NineSync components)');
} else {
  rmSync(dist, { recursive: true, force: true });
  const { tokens: contract } = await import('@rnine/core/tokens');
  const data = buildTokens({ root, contract });
  // base.scss uses the shared mixins: "@rnine/core/scss" is core's scss/_index.scss
  const importers = [{ findFileUrl: (url) => (url === '@rnine/core/scss' ? pathToFileURL(join(core, 'scss', '_index.scss')) : null) }];
  const base = sass.compile(join(root, 'scss', 'base.scss'), { style: 'expanded', importers }).css;
  writeFileSync(join(dist, 'ninesync-base.css'), `/* NineSync's own base styles and keyframes. Generated from scss/base.scss. */\n${base}\n`);
  console.log(`${data.name}: ${Object.values(data.groups).flat().length + data.schemes.light.length} tokens -> dist/`);
}
