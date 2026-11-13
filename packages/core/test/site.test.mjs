// Core's sites (Storybook, brand kit) list the themes next to core: every one
// must be found, with its mood names and readable colors for its card.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSite } from '../site/themes.mjs';
import { contrast, textPairs } from '../site/shell/contrast.ts';

const packages = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const themeDirs = readdirSync(packages).filter((dir) => dir !== 'core' && existsSync(join(packages, dir, 'theme.json')));
const site = loadSite();

test('every package next to core with a theme.json gets a card', () => {
  assert.deepEqual(site.themes.map((t) => t.id).sort(), [...themeDirs].sort());
  for (const theme of site.themes) {
    assert.ok(theme.name, `${theme.id}: a name`);
    assert.ok(theme.tagline, `${theme.id}: a tagline in theme.json`);
    assert.match(theme.package, /^@[\w-]+\/[\w-]+$/);
    for (const mood of ['light', 'dark']) assert.ok(theme.moods[mood].label, `${theme.id}: ${mood} mood label`);
  }
});

test("each card's colors come from the theme's own tokens", () => {
  for (const theme of site.themes) {
    for (const mood of ['light', 'dark']) {
      for (const role of ['bg', 'surface', 'fg', 'accent', 'signal']) {
        assert.match(theme.colors[mood][role] ?? '', /^#[0-9A-F]{6}$/i, `${theme.id} ${mood} ${role}`);
      }
    }
  }
});

test("each card's monogram, when there is one, is an SVG with filled paths", () => {
  for (const theme of site.themes.filter((t) => t.monogram)) {
    assert.match(theme.monogram, /<svg[\s\S]*\sd="/, `${theme.id}: monogram`);
  }
});

test('a theme with a monogram has a card picture in both moods; without its own emblem, its app icon on its accent', () => {
  for (const theme of site.themes.filter((t) => t.monogram)) {
    for (const mood of ['light', 'dark']) assert.match(theme.emblem?.[mood] ?? '', /^<svg[\s\S]*<\/svg>\s*$/, `${theme.id} ${mood}: emblem`);
    const own = JSON.parse(readFileSync(join(packages, theme.id, 'theme.json'), 'utf8')).emblem;
    if (own) continue;
    for (const mood of ['light', 'dark']) {
      assert.ok(theme.emblem[mood].includes(`fill="${theme.colors[mood].accent}"`), `${theme.id} ${mood}: plate in its accent`);
      assert.ok(theme.emblem[mood].includes(`fill="${theme.colors[mood]['on-accent']}"`), `${theme.id} ${mood}: monogram in on-accent`);
    }
  }
});

test("each card's text is readable on its mood (WCAG AA)", () => {
  for (const theme of site.themes) {
    for (const mood of ['light', 'dark']) {
      const roles = theme.colors[mood];
      for (const pair of textPairs(roles)) {
        const ratio = contrast(roles[pair.text], roles[pair.on]);
        assert.ok(ratio >= (pair.large ? 3 : 4.5), `${theme.id} ${mood}: ${pair.text} on ${pair.on} is ${ratio.toFixed(2)}`);
      }
    }
  }
});

test('the old root only names a theme that exists', () => {
  assert.ok(site.formerRoot === null || site.themes.some((t) => t.id === site.formerRoot));
});
