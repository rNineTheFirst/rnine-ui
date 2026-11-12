// Builds NineOS's CSS around the Vite library build:
//   node scripts/build.mjs           before vite: dist/tokens.*, dist/_variables.scss, dist/nineos-base.css
//   node scripts/build.mjs --bundle  after vite:  dist/styles.css
//
// styles.css, in order: NineOS tokens, core's base.css, NineOS's own base
// (its keyframes), core's components.css, NineOS's components.css.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
      read(join(dist, 'nineos-base.css')),
      read(join(core, 'dist', 'components.css')),
      read(join(dist, 'components.css')),
    ].join('\n'),
  );
  console.log('NineOS: dist/styles.css (tokens + base + core components + NineOS components)');
} else {
  rmSync(dist, { recursive: true, force: true });
  const { tokens: contract } = await import('@rnine/core/tokens');
  const data = buildTokens({ root, contract });
  const base = sass.compile(join(root, 'scss', 'base.scss'), { style: 'expanded' }).css;
  writeFileSync(join(dist, 'nineos-base.css'), `/* NineOS's own keyframes. Generated from scss/base.scss. */\n${base}\n`);
  console.log(`${data.name}: ${Object.values(data.groups).flat().length + data.schemes.light.length} tokens -> dist/`);
}
