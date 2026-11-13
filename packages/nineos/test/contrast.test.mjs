// NineOS conforms to the family's contract: every text color in both moods,
// in every palette (Magenta, Acid, Volt), meets WCAG 2.2 AA on the surfaces it's used on, both moods define the same
// roles, every token core components read exists (checked at build too),
// every @rnine/core export is exported here, and the theme config matches
// theme.json. Runs against the build (turbo runs build before test).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tokens } from '../dist/tokens.js';
import { tokens as core } from '@rnine/core/tokens';
import { contractProblems, contrastChecks, missingExports, CORE_KEYFRAMES } from '@rnine/core/conformance';

for (const c of contrastChecks(tokens)) {
  test(`${c.palette} ${c.scheme}: ${c.fg} on ${c.bg} >= ${c.min}:1`, () => {
    assert.ok(c.ok, `${c.fg} ${c.fgValue} on ${c.bg} ${c.bgValue} is ${c.ratio.toFixed(2)}:1`);
  });
}

test('every palette is checked, the default first', () => {
  assert.deepEqual(tokens.palettes.map((p) => [p.id, p.default]), [['magenta', true], ['acid', false], ['volt', false]]);
  const checked = new Set(contrastChecks(tokens).map((c) => `${c.palette} ${c.scheme}`));
  assert.equal(checked.size, tokens.palettes.length * 2);
});

test('the default palette is the moods as they are', () => {
  const magenta = tokens.palettes.find((p) => p.default);
  assert.deepEqual(magenta.schemes, tokens.schemes);
});

test('styles.css scopes every palette, and the default needs no attribute', () => {
  const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
  for (const p of tokens.palettes) {
    assert.ok(css.includes(`[data-palette="${p.id}"][data-scheme="dark"] {`), `no dark block for ${p.id}`);
    assert.ok(css.includes(`:root[data-palette="${p.id}"],\n[data-palette="${p.id}"][data-scheme="light"] {`), `no light block for ${p.id}`);
  }
  assert.match(css, /:root \{[^}]*--r9-color-accent-600: #D4006F;/);
});

test('both moods define the same roles', () => {
  const names = Object.values(tokens.schemes).map((list) => list.map((r) => r.name).sort().join());
  assert.equal(new Set(names).size, 1);
});

test('defines every token core components read', () => {
  assert.deepEqual(contractProblems(core, tokens), []);
});

test('exports every @rnine/core and @rnine/core/motion name', async () => {
  assert.deepEqual(missingExports(await import('@rnine/core'), await import('../dist/index.js')), []);
  assert.deepEqual(missingExports(await import('@rnine/core/motion'), await import('../dist/motion.js')), []);
  assert.deepEqual(missingExports(await import('@rnine/core/pages'), await import('../dist/pages.js')), []);
});

test('static pages: NineOS’s own look, fonts that exist, the same boot script as apps', async () => {
  const pages = await import('../dist/pages.js');
  const { moodBootScript } = await import('../dist/index.js');
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  assert.deepEqual(pages.pageFonts.map((f) => f.id), ['chakra-petch-600', 'chakra-petch-700', 'hanken-grotesk', 'share-tech-mono']);
  for (const f of pages.pageFonts) assert.ok(require.resolve(f.src), f.src);
  const opts = { storageKey: 'k', motionStorageKey: 'm' };
  assert.equal(pages.moodBootScript(opts), moodBootScript(opts));
  const html = pages.statusPage({ title: 'T', label: 'L', heading: 'H', paragraphs: [], status: { text: 's' }, palette: 'volt', fontsUrl: '/f/' });
  assert.match(html, /data-palette="volt"/);
  assert.match(html, /setAttribute\('aria-label',text\)/); // the decrypt
  assert.match(html, /<link rel="preload" href="\/f\/chakra-petch-700\.woff2"/);
  // Its favicon plate: cut top-left and bottom-right corners, the accent of the light mood
  assert.match(pages.markIcon({ mark: { viewBox: '0 0 1 1', paths: '' } }), /<path d="M12 0H64V52L52 64H0V12Z" fill="#D4006F"\/>/);
});

test('styles.css has every shared keyframe, and NineOS’s own', () => {
  const css = readFileSync(new URL('../dist/styles.css', import.meta.url), 'utf8');
  for (const name of [...CORE_KEYFRAMES, 'slice-a', 'slice-b', 'drift', 'band']) {
    assert.match(css, new RegExp(`@keyframes r9-${name}\\b`), `missing @keyframes r9-${name}`);
  }
});

test('NINEOS_THEME matches theme.json', async () => {
  // fonts: checked with the static pages above
  // tagline, monogram(s) and emblem are for core's sites (core/site/themes.mjs), not the theme config
  const { palette, fonts: _fonts, tagline: _tagline, monogram: _monogram, simplifiedMonogram: _simplified, emblem: _emblem, ...theme } = JSON.parse(readFileSync(new URL('../theme.json', import.meta.url), 'utf8'));
  const { NINEOS_THEME } = await import('../dist/index.js');
  const def = tokens.palettes.find((p) => p.default);
  assert.deepEqual({ id: def.id, label: def.label, description: def.description }, palette);
  assert.deepEqual({ name: NINEOS_THEME.name, moods: NINEOS_THEME.moods, auto: NINEOS_THEME.auto }, theme);
  assert.deepEqual({ name: tokens.name, moods: tokens.moods, auto: tokens.auto }, theme);
});
