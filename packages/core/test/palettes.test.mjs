// The token build tool's optional palettes (tokens/palettes/<id>.json), built
// on a copy of core's own tokens: core itself ships one palette.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildTokens } from '../scripts/build-tokens.mjs';
import { contrastChecks } from '../scripts/conformance.mjs';

const core = new URL('..', import.meta.url);

/** A throwaway library: core's tokens plus the given palettes and theme.json changes */
function library({ palettes = {}, theme = { palette: { id: 'blue', label: 'Blue' } } } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'r9-palettes-'));
  cpSync(new URL('tokens', core), join(root, 'tokens'), { recursive: true });
  const base = JSON.parse(readFileSync(new URL('theme.json', core), 'utf8'));
  writeFileSync(join(root, 'theme.json'), JSON.stringify({ ...base, ...theme }));
  if (Object.keys(palettes).length) {
    mkdirSync(join(root, 'tokens', 'palettes'));
    for (const [id, json] of Object.entries(palettes)) writeFileSync(join(root, 'tokens', 'palettes', `${id}.json`), JSON.stringify(json));
  }
  return root;
}

const TEAL = {
  label: 'Teal',
  color: { blue: { 600: { $value: '#00706A' } } },
  themes: { light: { selection: { $value: '#00706A33' } }, dark: { selection: { $value: '#2FD4C94D' } } },
};

function build(options) {
  const root = library(options);
  try {
    const data = buildTokens({ root });
    return { data, css: readFileSync(join(root, 'dist', 'tokens.css'), 'utf8') };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('without palettes: no palette blocks, an empty list', () => {
  const { data, css } = build({ theme: {} });
  assert.deepEqual(data.palettes, []);
  assert.doesNotMatch(css, /data-palette/);
});

test('a palette swaps primitives and the roles made from them, in both moods', () => {
  const { data, css } = build({ palettes: { teal: TEAL } });
  assert.deepEqual(data.palettes.map((p) => [p.id, p.default]), [['blue', true], ['teal', false]]);
  const teal = data.palettes[1];
  assert.equal(teal.schemes.light.find((r) => r.name === 'accent').value, '#00706A');
  assert.equal(teal.schemes.light.find((r) => r.name === 'selection').value, '#00706A33');
  assert.equal(teal.schemes.dark.find((r) => r.name === 'selection').value, '#2FD4C94D');
  // The default resets what any palette swaps, so a preview can sit inside another palette
  assert.match(css, /\[data-palette="blue"\] \{\n {2}--r9-color-blue-600: #[0-9A-F]{6};\n\}/);
  assert.match(css, /\[data-palette="teal"\]\[data-scheme="dark"\] \{[^}]*--r9-selection: #2FD4C94D;/);
  assert.match(css, /:root\[data-palette="teal"\],\n\[data-palette="teal"\]\[data-scheme="light"\] \{[^}]*--r9-accent: var\(--r9-color-blue-600\);/);
  // Own-element rules come after the mood scopes inside a palette
  assert.ok(css.indexOf('[data-palette="teal"] [data-scheme="dark"]') < css.indexOf(':root[data-palette="blue"]'));
});

test('contrast checks cover every palette in every mood', () => {
  const { data } = build({ palettes: { teal: TEAL } });
  const views = new Set(contrastChecks(data).map((c) => `${c.palette} ${c.scheme}`));
  assert.deepEqual([...views].sort(), ['blue dark', 'blue light', 'teal dark', 'teal light']);
});

test('rejects palettes that would break the library', () => {
  const bad = (palettes, message, theme) => assert.throws(() => build({ palettes, ...(theme ? { theme } : {}) }), message);
  bad({ teal: TEAL }, /add "palette"/, {});
  bad({ teal: { ...TEAL, color: { pink: { 500: { $value: '#FF00AA' } } } } }, /not one of the library's color primitives/);
  bad({ teal: { ...TEAL, color: { blue: { 600: { $value: '{color.gray.0}' } } } } }, /not a reference/);
  bad({ teal: { ...TEAL, themes: { light: { selection: { $value: '#00000033' } } } } }, /same roles/);
  bad({ teal: { ...TEAL, themes: { light: { glow: { $value: '#000' } }, dark: { glow: { $value: '#000' } } } } }, /not a mood role/);
  bad({ blue: TEAL }, /default palette's id/);
  bad({ teal: { ...TEAL, label: undefined } }, /needs a label/);
});
