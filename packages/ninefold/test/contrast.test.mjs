// Ninefold conforms to the family's contract: every text color in both moods
// (Glint and Gloam) meets WCAG 2.2 AA on the surfaces it's used on, both
// moods define the same roles, every token core components read exists
// (checked at build too), every @rnine/core export is exported here, and the
// theme config matches theme.json. Runs against the build (turbo runs build before test).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tokens } from '../dist/tokens.js';
import { tokens as core } from '@rnine/core/tokens';
import { contractProblems, contrastChecks, contrast, missingExports, CORE_KEYFRAMES } from '@rnine/core/conformance';

for (const c of contrastChecks(tokens)) {
  test(`${c.scheme}: ${c.fg} on ${c.bg} >= ${c.min}:1`, () => {
    assert.ok(c.ok, `${c.fg} ${c.fgValue} on ${c.bg} ${c.bgValue} is ${c.ratio.toFixed(2)}:1`);
  });
}

test('Ninefold’s own roles are readable where they carry meaning', () => {
  for (const [scheme, roles] of Object.entries(tokens.schemes)) {
    const color = Object.fromEntries(roles.map((r) => [r.name, r.value]));
    // Writing and the leaves are drawn lines, not text: 3:1 against the paper (wax is the seal's
    // body, between its highlight and its shadow, and carries nothing alone)
    for (const role of ['ink-wet', 'leaf']) {
      assert.ok(contrast(color[role].slice(0, 7), color.bg) >= 3, `${scheme}: ${role} ${color[role]} on bg is ${contrast(color[role].slice(0, 7), color.bg).toFixed(2)}:1`);
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

test('defines every token core components read, and folds only its cards', () => {
  assert.deepEqual(contractProblems(core, tokens), []);
  const shape = Object.fromEntries(tokens.groups.shape.map((t) => [t.name, t.value]));
  assert.deepEqual(shape, { 'shape-cut': 0, 'shape-round': 1, 'shape-card-cut': 1.4445 });
});

test('exports every @rnine/core, @rnine/core/motion and @rnine/core/pages name', async () => {
  assert.deepEqual(missingExports(await import('@rnine/core'), await import('../dist/index.js')), []);
  assert.deepEqual(missingExports(await import('@rnine/core/motion'), await import('../dist/motion.js')), []);
  assert.deepEqual(missingExports(await import('@rnine/core/pages'), await import('../dist/pages.js')), []);
});

test('static pages: Ninefold’s paper and fonts, the same boot script as apps', async () => {
  const pages = await import('../dist/pages.js');
  const { moodBootScript } = await import('../dist/index.js');
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  assert.deepEqual(pages.pageFonts.map((f) => f.id), ['fraunces', 'literata', 'courier-prime', 'pinyon-script']);
  for (const f of pages.pageFonts) assert.ok(require.resolve(f.src), f.src);
  const opts = { storageKey: 'k', motionStorageKey: 'm' };
  assert.equal(pages.moodBootScript(opts), moodBootScript(opts));
  const html = pages.statusPage({ title: 'T', label: 'L', heading: 'H', paragraphs: [], status: { text: 's' }, fontsUrl: '/f/' });
  assert.match(html, /--r9-wax:/);
  assert.match(html, /mask-image:\s*url\("?data:image\/svg\+xml,/); // the paper
  assert.match(html, /<link rel="preload" href="\/f\/fraunces\.woff2"/);
  // Its favicon plate: rounded, the ink of the light mood
  assert.match(pages.markIcon({ mark: { viewBox: '0 0 1 1', paths: '' } }), /#22408E/);
});

test('styles.css has every shared keyframe, Ninefold’s own and the paper', () => {
  const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
  for (const name of [...CORE_KEYFRAMES, 'breathe', 'window-drift', 'orbit', 'swing']) {
    assert.match(css, new RegExp(`@keyframes r9-${name}\\b`), `missing @keyframes r9-${name}`);
  }
  assert.match(css, /body::before \{\s*background: var\(--r9-dot\);/);
  assert.match(css, /font-variation-settings: "SOFT" 100, "WONK" 1/);
});

test('NINEFOLD_THEME matches theme.json, with the tuned card lift', async () => {
  // tagline, monogram(s) and emblem are for core's sites (core/site/themes.mjs), not the theme config
  const { fonts: _fonts, tagline: _tagline, monogram: _monogram, simplifiedMonogram: _simplified, emblem: _emblem, ...theme } = JSON.parse(readFileSync(new URL('../theme.json', import.meta.url), 'utf8'));
  const { NINEFOLD_THEME } = await import('../dist/index.js');
  assert.deepEqual({ name: NINEFOLD_THEME.name, moods: NINEFOLD_THEME.moods, auto: NINEFOLD_THEME.auto }, theme);
  assert.deepEqual({ name: tokens.name, moods: tokens.moods, auto: tokens.auto }, theme);
  assert.deepEqual(NINEFOLD_THEME.lift, { by: 34, reach: 450, follow: 0.4 });
});
