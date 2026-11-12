#!/usr/bin/env node
// Checks that this folder stands alone, so it can be published as its own repo:
//   - every package has the MIT license, and LICENSE + README are here
//   - packages import only each other and their declared npm dependencies
//   - no relative path reaches outside this folder
//   - no host-specific naming (a site's own name or domain) in code or docs
//
//   node scripts/boundary.mjs        (yarn boundary)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const rel = (file) => relative(root, file).split(sep).join('/');

for (const file of ['LICENSE', 'README.md', 'package.json']) {
  if (!existsSync(join(root, file))) problems.push(`${file} is missing`);
}
if (existsSync(join(root, 'LICENSE')) && !readFileSync(join(root, 'LICENSE'), 'utf8').startsWith('MIT License')) {
  problems.push('LICENSE is not the MIT license');
}

const packagesDir = join(root, 'packages');
const packages = readdirSync(packagesDir)
  .filter((name) => existsSync(join(packagesDir, name, 'package.json')))
  .map((name) => {
    const dir = join(packagesDir, name);
    return { dir, manifest: JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) };
  });
const own = new Set(packages.map((p) => p.manifest.name));

const SKIP = new Set(['node_modules', 'dist', 'storybook-static', 'coverage', '.turbo', '.cloudflare', '.git']);
const TEXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.md', '.mdx', '.scss', '.css', '.html', '.yml', '.yaml', '.svg']);
const CODE = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.mdx']);

function* files(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      // Build leftovers some tools drop next to their config
      if (!name.startsWith('.') || name === '.storybook' || name === '.github') yield* files(path);
    } else if (TEXT.has(extname(name)) && !name.includes('.timestamp-')) yield path;
  }
}

// A site's own name or domain: the libraries' npm scope (@rnine/...) and the
// public repo's name (rnine-ui) are the only allowed uses of the word
const HOST = [/(?<![@\w])rnine(?!-ui\b)(?![\w/])/i, /\bnine-app\b/i, /\br9-mk-\d/i];

const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|^\s*import\s+|@use\s+|@import\s+|@forward\s+)['"]([^'"]+)['"]/gm;

for (const pkg of packages) {
  const name = pkg.manifest.name;
  if (pkg.manifest.license !== 'MIT') problems.push(`${name}: package.json "license" must be "MIT"`);
  const declared = new Set([
    ...Object.keys(pkg.manifest.dependencies ?? {}),
    ...Object.keys(pkg.manifest.peerDependencies ?? {}),
    ...Object.keys(pkg.manifest.devDependencies ?? {}),
  ]);
  for (const dep of declared) {
    if (dep.startsWith('@rnine/') && !own.has(dep)) problems.push(`${name}: depends on ${dep}, which isn't in this folder`);
  }

  for (const file of files(pkg.dir)) {
    const text = readFileSync(file, 'utf8');
    text.split(/\r?\n/).forEach((line, i) => {
      for (const pattern of HOST) {
        if (pattern.test(line)) problems.push(`${rel(file)}:${i + 1}: host-specific name: ${line.trim().slice(0, 120)}`);
      }
    });
    if (!CODE.has(extname(file)) && extname(file) !== '.scss') continue;
    for (const [, spec] of text.matchAll(SPECIFIER)) {
      if (spec.startsWith('.')) {
        const target = resolve(dirname(file), spec);
        if (relative(root, target).startsWith('..')) problems.push(`${rel(file)}: "${spec}" reaches outside this folder`);
        continue;
      }
      if (spec.startsWith('node:') || spec.startsWith('virtual:') || /^[a-z]+:/.test(spec)) continue;
      const bare = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
      if (bare === name) continue;
      if (bare.startsWith('@rnine/') && !own.has(bare)) problems.push(`${rel(file)}: imports ${bare}, which isn't in this folder`);
    }
  }
}

// Top-level docs and CI too
for (const file of [...readdirSync(root).filter((f) => TEXT.has(extname(f))).map((f) => join(root, f)), ...(existsSync(join(root, '.github')) ? files(join(root, '.github')) : [])]) {
  readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
    for (const pattern of HOST) {
      if (pattern.test(line)) problems.push(`${rel(file)}:${i + 1}: host-specific name: ${line.trim().slice(0, 120)}`);
    }
  });
}

if (problems.length) {
  console.error(`This folder doesn't stand alone (${problems.length}):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`Stands alone: ${packages.length} packages (${[...own].join(', ')}), MIT, no outside imports or host names.`);
