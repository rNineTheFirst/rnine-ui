#!/usr/bin/env node
// Sets the one shared version on every package in packages/ and every exact
// pin on them (nineos's @rnine/core dependency, and any other workspace that
// depends on them), so a release is one command and one commit.
//
//   yarn release:version 0.2.0
//   node scripts/version.mjs 0.2.0 --root <dir>   also update the workspaces
//                                                 of the repository at <dir>
//
// A pin that doesn't match the workspace's version makes Yarn install that
// package from npm instead of linking the workspace, so every pin moves too.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ossRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const rootFlag = args.indexOf('--root');
const repoRoot = rootFlag === -1 ? ossRoot : resolve(args[rootFlag + 1] ?? '.');
const version = args.filter((a, i) => !a.startsWith('--') && (rootFlag === -1 || i !== rootFlag + 1))[0];

const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
if (!version || !SEMVER.test(version)) {
  console.error('Usage: node scripts/version.mjs <version> [--root <dir>]   (e.g. 0.2.0 or 0.3.0-beta.1)');
  process.exit(1);
}

// Workspace folders from a package.json "workspaces" list ("dir/*" or "dir")
const workspaces = (root) => {
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const globs = Array.isArray(manifest.workspaces) ? manifest.workspaces : manifest.workspaces?.packages ?? [];
  return globs.flatMap((glob) => {
    if (!glob.endsWith('/*')) return [join(root, glob)];
    const base = join(root, glob.slice(0, -2));
    if (!existsSync(base)) return [];
    return readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => join(base, d.name));
  }).filter((dir) => existsSync(join(dir, 'package.json')));
};

const libraries = workspaces(ossRoot);
const names = libraries.map((dir) => JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name);
const libraryDirs = new Set(libraries.map((dir) => resolve(dir)));
const targets = [...new Set([...libraries, ...workspaces(repoRoot)].map((dir) => resolve(dir)))];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
let changed = 0;
for (const dir of targets) {
  const file = join(dir, 'package.json');
  const before = readFileSync(file, 'utf8');
  let text = before;
  // Edit the text, not a re-serialized object, so formatting stays as it is
  if (libraryDirs.has(dir)) text = text.replace(/("version"\s*:\s*")[^"]*(")/, `$1${version}$2`);
  for (const name of names) {
    text = text.replace(new RegExp(`("${escape(name)}"\\s*:\\s*")([^"]*)(")`, 'g'), (match, open, current, close) =>
      SEMVER.test(current) ? `${open}${version}${close}` : match);
  }
  if (text !== before) {
    writeFileSync(file, text);
    changed += 1;
    console.log(`${file.slice(repoRoot.length + 1).replace(/\\/g, '/')}`);
  }
}
console.log(changed ? `Set ${names.join(', ')} to ${version} in ${changed} package.json files. Run yarn install next.` : `Already ${version}.`);
