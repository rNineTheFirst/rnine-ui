// Builds @rnine/core's CSS around the Vite library build:
//   node scripts/build.mjs           before vite: dist/tokens.*, dist/_variables.scss, dist/base.css
//   node scripts/build.mjs --bundle  after vite:  dist/styles.css = tokens + base + components
//
// base.css (element styles and the shared keyframes, no token values) and
// components.css (every core component) are also what brand libraries bundle
// into their own styles.css, after their own tokens.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import { buildTokens } from './build-tokens.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const read = (file) => readFileSync(join(dist, file), 'utf8');

if (process.argv.includes('--bundle')) {
  writeFileSync(join(dist, 'styles.css'), [read('tokens.css'), read('base.css'), read('components.css')].join('\n'));
  console.log('Core: dist/styles.css (Plain tokens + base + components)');
} else {
  rmSync(dist, { recursive: true, force: true });
  const data = buildTokens({ root });
  const base = sass.compile(join(root, 'scss', 'base.scss'), { style: 'expanded' }).css;
  writeFileSync(join(dist, 'base.css'), `/* Base element styles and shared keyframes. Generated from scss/base.scss. */\n${base}\n`);
  console.log(`${data.name}: ${Object.values(data.groups).flat().length + data.schemes.light.length} tokens -> dist/`);
}
