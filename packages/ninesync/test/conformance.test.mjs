// NineSync conforms to the family's contract: every text color in both moods
// meets WCAG 2.2 AA on the surfaces it's used on, both moods define the same
// roles, every token core components read exists (checked at build too),
// every @rnine/core export is exported here, and the theme config matches
// theme.json. It also checks what's NineSync's own: the built tokens are
// syncColors() for the default client colors, and every core class name the
// look stylesheet (src/look.scss) styles still exists in core.
// Runs against the build (turbo runs build before test).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { tokens } from '../dist/tokens.js';
import { tokens as core } from '@rnine/core/tokens';
import { contractProblems, contrastChecks, contrast, missingExports, CORE_KEYFRAMES } from '@rnine/core/conformance';

const require = createRequire(import.meta.url);
const coreDir = dirname(require.resolve('@rnine/core/package.json'));
const roleMap = (scheme) => Object.fromEntries(tokens.schemes[scheme].map((r) => [r.name, r.value]));

for (const c of contrastChecks(tokens)) {
  test(`${c.scheme}: ${c.fg} on ${c.bg} >= ${c.min}:1`, () => {
    assert.ok(c.ok, `${c.fg} ${c.fgValue} on ${c.bg} ${c.bgValue} is ${c.ratio.toFixed(2)}:1`);
  });
}

test('NineSync’s own roles: headings read, the pale mark shows on cards', () => {
  for (const scheme of ['light', 'dark']) {
    const color = roleMap(scheme);
    for (const bg of ['bg', 'surface', 'surface-raised']) assert.ok(contrast(color['fg-strong'], color[bg]) >= 7, `${scheme}: fg-strong on ${bg}`);
    assert.ok(contrast(color.mark, color.surface) >= 1.3, `${scheme}: mark ${color.mark} on surface is ${contrast(color.mark, color.surface).toFixed(2)}:1`);
    // The field edge is a component boundary: 3:1
    assert.ok(contrast(color['line-strong'], color.bg) >= 3 && contrast(color['line-strong'], color.surface) >= 3, `${scheme}: line-strong`);
  }
});

test('the built moods are syncColors() for the default client colors', async () => {
  const { syncColors, DEFAULT_CLIENT_COLORS } = await import('../dist/index.js');
  assert.deepEqual(DEFAULT_CLIENT_COLORS, { brand: '#2B4D82', dark: '#A2C4F6' });
  const result = syncColors();
  assert.equal(result.ok, true);
  for (const scheme of ['light', 'dark']) {
    assert.deepEqual(result[scheme].roles, roleMap(scheme), `tokens/themes/${scheme}.json is stale: run node scripts/themes.mts`);
  }
});

test('client colors: the CSS covers both moods and the system dark setting', async () => {
  const { clientThemeCss, syncColors } = await import('../dist/index.js');
  const css = clientThemeCss({ brand: '#F07F13', light: '#A04E00' });
  assert.match(css, /:root\[data-scheme="light"\], :root:not\(\[data-scheme\]\) \{/);
  assert.match(css, /@media \(prefers-color-scheme: dark\) \{\n {2}:root:not\(\[data-scheme\]\) \{/);
  assert.match(css, /:root\[data-scheme="dark"\] \{[^}]*--r9-accent: #F07F13;/);
  assert.match(css, /--r9-accent-text: #A04E00;/);
  const scoped = clientThemeCss({ brand: '#0B6E4F' }, '.preview');
  assert.match(scoped, /^\.preview\[data-scheme="light"\]/);
  // Every client color keeps the contract's text pairs (failing ones through the stand-in)
  for (const brand of ['#F07F13', '#FFDD00', '#0B6E4F', '#7F00FF', '#111111', '#FFFFFF']) {
    const r = syncColors({ brand });
    for (const scheme of ['light', 'dark']) {
      const c = r[scheme].roles;
      for (const fg of ['fg', 'fg-muted', 'accent-text']) for (const bg of ['bg', 'surface']) {
        assert.ok(contrast(c[fg], c[bg]) >= 4.5, `${brand} ${scheme}: ${fg} on ${bg}`);
      }
      assert.ok(contrast(c['on-accent'], c.accent) >= 4.5, `${brand} ${scheme}: on-accent`);
    }
  }
});

test('one palette, the moods as they are', () => {
  assert.deepEqual(tokens.palettes, []);
});

test('both moods define the same roles', () => {
  const names = Object.values(tokens.schemes).map((list) => list.map((r) => r.name).sort().join());
  assert.equal(new Set(names).size, 1);
});

test('defines every token core components read, and cuts no corners', () => {
  assert.deepEqual(contractProblems(core, tokens), []);
  const shape = Object.fromEntries(tokens.groups.shape.map((t) => [t.name, t.value]));
  assert.deepEqual(shape, { 'shape-cut': 0, 'shape-round': 1, 'shape-card-cut': 0 });
});

test('exports every @rnine/core, @rnine/core/motion and @rnine/core/pages name', async () => {
  assert.deepEqual(missingExports(await import('@rnine/core'), await import('../dist/index.js')), []);
  assert.deepEqual(missingExports(await import('@rnine/core/motion'), await import('../dist/motion.js')), []);
  assert.deepEqual(missingExports(await import('@rnine/core/pages'), await import('../dist/pages.js')), []);
});

test('static pages: DM Sans and DM Mono, the same boot script as apps', async () => {
  const pages = await import('../dist/pages.js');
  const { moodBootScript } = await import('../dist/index.js');
  assert.deepEqual(pages.pageFonts.map((f) => f.id), ['dm-sans', 'dm-mono']);
  for (const f of pages.pageFonts) assert.ok(require.resolve(f.src), f.src);
  const opts = { storageKey: 'k', motionStorageKey: 'm' };
  assert.equal(pages.moodBootScript(opts), moodBootScript(opts));
  const html = pages.statusPage({ title: 'T', label: 'L', heading: 'H', paragraphs: [], status: { text: 's' }, fontsUrl: '/f/' });
  assert.match(html, /--r9-mark:/);
  assert.match(html, /<link rel="preload" href="\/f\/dm-sans\.woff2"/);
});

test('styles.css has every shared keyframe and NineSync’s own', () => {
  const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
  for (const name of [...CORE_KEYFRAMES, 'settle', 'rise', 'rise-title', 'mark-draw', 'wash', 'pop', 'ring', 'sweep', 'drawer-in']) {
    assert.match(css, new RegExp(`@keyframes r9-${name}\\b`), `missing @keyframes r9-${name}`);
  }
  assert.match(css, /mark \{[^}]*background-size: 100% max\(2px, 0\.14em\)/);
});

test('every core class the look restyles still exists in core', () => {
  const look = readFileSync(new URL('../dist/components.css', import.meta.url), 'utf8');
  const coreCss = readFileSync(join(coreDir, 'dist', 'components.css'), 'utf8');
  const used = [...new Set([...look.matchAll(/\[class\*="?(r9-[A-Za-z]+-module_[A-Za-z]+_)"?\]/g)].map((m) => m[1]))];
  assert.ok(used.length >= 15, `found only ${used.length} core classes`);
  const missing = used.filter((name) => !coreCss.includes(`.${name}`));
  assert.deepEqual(missing, [], 'core renamed a class src/look.scss styles');
});

test('NINESYNC_THEME matches theme.json', async () => {
  const { fonts: _fonts, tagline: _tagline, ...theme } = JSON.parse(readFileSync(new URL('../theme.json', import.meta.url), 'utf8'));
  const { NINESYNC_THEME } = await import('../dist/index.js');
  assert.deepEqual({ name: NINESYNC_THEME.name, moods: NINESYNC_THEME.moods, auto: NINESYNC_THEME.auto }, theme);
  assert.deepEqual({ name: tokens.name, moods: tokens.moods, auto: tokens.auto }, theme);
});
