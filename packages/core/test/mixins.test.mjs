// The shared mixins compile to what each library's tokens make of them: a
// card's cut follows shape.card-cut and the lift, and the paper textures paint
// in a token color through a mask. Runs against the build (dist/_variables.scss).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
const compile = (body) =>
  sass.compileString(`@use "scss" as r9;\n${body}`, { loadPaths: [pkg], style: 'expanded' }).css;

test('card-corner cuts the top right by shape.card-cut plus the lift, with the same points as corner(lg, tr)', () => {
  const card = compile('.a { @include r9.card-corner(lg); }');
  const cut = 'calc(var(--r9-corner-lg) * var(--r9-shape-card-cut) + var(--r9-card-lift, 0px))';
  assert.ok(card.includes(`calc(100% - ${cut}) 0, 100% ${cut},`), card);
  assert.match(card, /border-radius: calc\(var\(--r9-corner-lg\) \* var\(--r9-shape-round\)\)/);
  const points = (css) => css.match(/polygon\((.*)\)/)[1].split(/,(?![^(]*\))/).length;
  assert.equal(points(card), points(compile('.a { @include r9.corner(lg, tr); }')));
});

test('card-ornament sits on the card cut and shows only where cards are cut', () => {
  const css = compile('.a { @include r9.card-ornament; }');
  assert.match(css, /width: calc\(var\(--r9-corner-lg\) \* var\(--r9-shape-card-cut\) \+ var\(--r9-card-lift, 0px\)\)/);
  assert.match(css, /opacity: var\(--r9-shape-card-cut\)/);
});

test('texture(fibers) and texture(grain) paint a token color through a tiled mask', () => {
  const fibers = compile('.a { @include r9.texture(fibers); }');
  assert.match(fibers, /background: var\(--r9-dot\)/);
  assert.match(fibers, /(?<!-)mask-image: url\("data:image\/svg\+xml,[^"]+"\);/);
  assert.match(fibers, /-webkit-mask-image: url/);
  assert.match(fibers, /(?<!-)mask-size: 240px 240px;/);
  const grain = compile('.a { @include r9.texture(grain, 120px, red); }');
  assert.match(grain, /background: red/);
  assert.match(grain, /feTurbulence/);
  assert.match(grain, /(?<!-)mask-size: 120px 120px;/);
});

test('texture() names its kinds when given another', () => {
  assert.throws(() => compile('.a { @include r9.texture(moss); }'), /field, grid, lines, fibers or grain/);
});
