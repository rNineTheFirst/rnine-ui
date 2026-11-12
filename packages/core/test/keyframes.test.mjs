// Shared keyframes (r9-pulse, r9-sheen, ... and a library's own) live once in
// the library's styles.css. A CSS module renames every animation name it
// sees, so a module that writes `animation: r9-pulse ...` points at keyframes
// that don't exist and the animation silently never plays. Modules must use
// r9.keyframes(pulse).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORE_KEYFRAMES } from '../scripts/conformance.mjs';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');

// The outermost folder whose package.json lists workspaces: every package in
// the repo this one is checked out in (and its apps, if any) gets checked
let repo = pkg;
for (let dir = pkg; dirname(dir) !== dir; dir = dirname(dir)) {
  const manifest = join(dir, 'package.json');
  if (existsSync(manifest) && JSON.parse(readFileSync(manifest, 'utf8')).workspaces) repo = dir;
}
const workspaces = [].concat(JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8')).workspaces ?? []);
// Any r9-<name> in an animation (not a custom property like --r9-duration-fast)
const SHARED = /animation(?:-name)?\s*:[^;{}]*(?<![\w-])r9-[a-z][\w-]*/;

function* modules(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* modules(path);
    else if (name.endsWith('.module.scss')) yield path;
  }
}

// Workspace globs are "folder/*"
const ROOTS = workspaces.flatMap((glob) => {
  const top = join(repo, glob.replace(/\/\*$/, ''));
  return existsSync(top) ? readdirSync(top).map((p) => join(top, p, 'src')) : [];
}).filter((p) => existsSync(p) && statSync(p).isDirectory());

test('CSS modules reach shared keyframes through r9.keyframes()', () => {
  assert.ok(ROOTS.length > 0, 'no workspaces found');
  const offenders = [];
  for (const root of ROOTS) {
    for (const file of modules(root)) {
      readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
        if (SHARED.test(line)) offenders.push(`${relative(repo, file)}:${i + 1}: ${line.trim()}`);
      });
    }
  }
  assert.deepEqual(offenders, [], `Use r9.keyframes(<name>) for shared keyframes in a module:\n${offenders.join('\n')}`);
});

test("every shared keyframe exists in core's base.css and styles.css", () => {
  for (const file of ['base.css', 'styles.css']) {
    const css = readFileSync(join(pkg, 'dist', file), 'utf8');
    for (const name of CORE_KEYFRAMES) {
      assert.match(css, new RegExp(`@keyframes r9-${name}\\b`), `${file}: missing @keyframes r9-${name}`);
    }
  }
});
