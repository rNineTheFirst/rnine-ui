// The brand kit's seal download is built from the same geometry as Mark.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BRANCHES, LEAF_STOPS, WAX, sealSvg } from '../src/motion/seal.ts';

const MARK = '<svg viewBox="0 0 100 100"><path d="M10 10H90V90H10Z"/><path d="M30 30H70V70H30Z"/></svg>';
const colors = { wax: '#8A2140', waxLight: '#C25674', waxDark: '#5E1229', leaf: '#5E6B2C' };

test('the seal SVG has the wax, the sprig and the mark to replace', () => {
  const svg = sealSvg(colors, MARK);
  assert.ok(svg.includes(`d="${WAX}"`), 'the wax outline');
  assert.equal((svg.match(/<path d="M0 0Q6/g) ?? []).length, BRANCHES.length * LEAF_STOPS.length, 'every leaf');
  assert.match(svg, /<g id="your-mark">/);
  // The mark twice (the light highlight and the pressed art), each with both paths
  assert.equal((svg.match(/<path d="M10 10H90V90H10Z"\/>/g) ?? []).length, 2);
  for (const color of Object.values(colors)) assert.ok(svg.includes(color), `uses ${color}`);
});

test('Mark draws from the same geometry', () => {
  const mark = readFileSync(new URL('../src/motion/Mark.tsx', import.meta.url), 'utf8');
  assert.match(mark, /from '\.\/seal'/);
  assert.doesNotMatch(mark, /const WAX\s*=/, 'no second copy of the wax outline');
});
