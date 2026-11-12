// Plain (core's own look) meets the same bar as every library: WCAG AA text
// in both moods, the same roles in both, and a theme config that matches
// theme.json. Runs against the build (turbo runs build before test).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tokens } from '../dist/tokens.js';
import { contrastChecks } from '../scripts/conformance.mjs';

for (const c of contrastChecks(tokens)) {
  test(`${c.scheme}: ${c.fg} on ${c.bg} >= ${c.min}:1`, () => {
    assert.ok(c.ok, `${c.fg} ${c.fgValue} on ${c.bg} ${c.bgValue} is ${c.ratio.toFixed(2)}:1`);
  });
}

test('both moods define the same roles', () => {
  const names = Object.values(tokens.schemes).map((list) => list.map((r) => r.name).sort().join());
  assert.equal(new Set(names).size, 1);
});

test('PLAIN_THEME matches theme.json', async () => {
  const theme = JSON.parse(readFileSync(new URL('../theme.json', import.meta.url), 'utf8'));
  const { PLAIN_THEME } = await import('../dist/kit.js');
  assert.deepEqual({ name: PLAIN_THEME.name, moods: PLAIN_THEME.moods, auto: PLAIN_THEME.auto }, theme);
  assert.deepEqual({ name: tokens.name, moods: tokens.moods, auto: tokens.auto }, theme);
});
