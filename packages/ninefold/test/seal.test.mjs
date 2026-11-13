// The brand kit's seal downloads and the theme card's emblem are built from the same geometry as Mark.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ART, WAX, sealSvg } from '../src/motion/seal.ts';
import { emblem } from '../kit/emblem.mjs';

const MARK = '<svg viewBox="0 0 100 100"><path d="M10 10H90V90H10Z"/><path d="M30 30H70V70H30Z"/></svg>';
const colors = { wax: '#8A2140', waxLight: '#C25674', waxDark: '#5E1229' };
const count = (svg, s) => svg.split(s).length - 1;

test('the large seal is poured wax with the mark pressed in (lit edge and impression)', () => {
  const svg = sealSvg(colors, MARK);
  assert.ok(svg.includes(`d="${WAX}"`), 'the wax outline');
  assert.match(svg, /<g id="your-mark">/);
  assert.match(svg, /feTurbulence/, 'grain');
  assert.match(svg, /<ellipse /, 'the sheen');
  assert.equal(count(svg, '<path d="M10 10H90V90H10Z"/>'), 2);
  assert.ok(svg.includes(`width="${ART.large.size}"`));
  for (const color of Object.values(colors)) assert.ok(svg.includes(color), `uses ${color}`);
  assert.doesNotMatch(svg, /M0 0Q6/, 'no sprig');
});

test('the small seal has no gloss, and a smaller mark with room around it', () => {
  const svg = sealSvg(colors, MARK, { small: true });
  assert.doesNotMatch(svg, /feTurbulence|<ellipse /);
  assert.equal(count(svg, '<path d="M10 10H90V90H10Z"/>'), 1);
  assert.ok(svg.includes(`width="${ART.small.size}"`));
  assert.ok(ART.small.size < ART.large.size);
});

test("the theme card's emblem is the seal in a mood's wax", () => {
  const svg = emblem({ monogram: MARK, colors: { wax: '#A8344F', 'wax-light': '#EF8DA0', 'wax-dark': '#6E1B30' } });
  assert.ok(svg.includes(`d="${WAX}"`));
  assert.ok(svg.includes('#A8344F'));
});

test('Mark draws from the same geometry', () => {
  const mark = readFileSync(new URL('../src/motion/Mark.tsx', import.meta.url), 'utf8');
  assert.match(mark, /from '\.\/seal'/);
  assert.doesNotMatch(mark, /const WAX\s*=/, 'no second copy of the wax outline');
});
