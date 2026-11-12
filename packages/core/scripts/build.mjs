// Builds @rnine/core's CSS around the Vite library build:
//   node scripts/build.mjs           before vite: dist/tokens.*, dist/_variables.scss, dist/base.css
//   node scripts/build.mjs --bundle  after vite:  dist/styles.css = tokens + base + components
//
// base.css (element styles and the shared keyframes, no token values) and
// components.css (every core component) are also what brand libraries bundle
// into their own styles.css, after their own tokens.
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import { buildTokens } from './build-tokens.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const read = (file) => readFileSync(join(dist, file), 'utf8');

// Third-party code bundled into dist/node_modules (simple-icons' marks) ships
// without source maps: they map the whole package (megabytes) and debugging
// it isn't this library's business
function dropVendorMaps(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) dropVendorMaps(path);
    else if (entry.name.endsWith('.map')) rmSync(path);
    else if (entry.name.endsWith('.js')) {
      writeFileSync(path, readFileSync(path, 'utf8').replace(/\n?\/\/# sourceMappingURL=\S+\s*$/, '\n'));
    }
  }
}

if (process.argv.includes('--bundle')) {
  writeFileSync(join(dist, 'styles.css'), [read('tokens.css'), read('base.css'), read('components.css')].join('\n'));
  dropVendorMaps(join(dist, 'node_modules'));
  console.log('Core: dist/styles.css (Plain tokens + base + components)');
} else {
  rmSync(dist, { recursive: true, force: true });
  const data = buildTokens({ root });
  const base = sass.compile(join(root, 'scss', 'base.scss'), { style: 'expanded' }).css;
  writeFileSync(join(dist, 'base.css'), `/* Base element styles and shared keyframes. Generated from scss/base.scss. */\n${base}\n`);
  console.log(`${data.name}: ${Object.values(data.groups).flat().length + data.schemes.light.length} tokens -> dist/`);
}
