#!/usr/bin/env node
// Publishes the libraries whose version on main isn't on npm yet, core first,
// then tags each published version (core@0.2.0, nineos@0.2.0) with a GitHub
// Release. Run by .github/workflows/publish.yml after build, test and smoke.
//
//   node scripts/publish.mjs              publish + tag (CI: npm Trusted Publishing)
//   node scripts/publish.mjs --dry-run    say what it would do, change nothing
//
// A release is a version bump: both packages share one version (nineos pins
// core to it exactly), changed together in one commit. A version with a
// hyphen (0.3.0-beta.1) goes out under the npm tag "next", not "latest".
//
// A package that has never been on npm is skipped: npm Trusted Publishing can
// only be set up for a package that exists, so its first version is published
// by hand (see CONTRIBUTING.md). Run the workflow again afterwards to tag it.
import { execFileSync, execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');
const ORDER = ['core', 'nineos']; // dependencies first

// On Windows npm and gh need a shell (npm is npm.cmd): one quoted command line
const quote = (a) => (/^[\w@./:=-]+$/.test(a) ? a : `"${a.replace(/"/g, '\\"')}"`);
const run = (cmd, args, opts = {}) => {
  const options = { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts };
  const out = process.platform === 'win32'
    ? execSync([cmd, ...args].map(quote).join(' '), options)
    : execFileSync(cmd, args, options);
  return (out ?? '').trim();
};
const tryRun = (cmd, args) => {
  try {
    return { ok: true, out: run(cmd, args) };
  } catch (error) {
    return { ok: false, out: `${error.stdout ?? ''}${error.stderr ?? ''}` };
  }
};
const say = (msg) => console.log(dryRun ? `[dry run] ${msg}` : msg);

const packages = ORDER.map((dir) => {
  const manifest = JSON.parse(readFileSync(join(root, 'packages', dir, 'package.json'), 'utf8'));
  return { dir, manifest, name: manifest.name, version: manifest.version, tag: `${dir}@${manifest.version}` };
});

// One version for all, and nineos built on exactly that core
const [core] = packages;
const problems = [];
for (const pkg of packages) {
  if (pkg.version !== core.version) problems.push(`${pkg.name} is ${pkg.version}, ${core.name} is ${core.version}: bump them together`);
  if (pkg.manifest.private) problems.push(`${pkg.name} is marked private`);
  const pinned = pkg.manifest.dependencies?.[core.name];
  if (pkg !== core && pinned !== core.version) problems.push(`${pkg.name} depends on ${core.name} "${pinned}", not "${core.version}"`);
}
if (problems.length) {
  for (const p of problems) console.error(`::error::${p}`);
  process.exit(1);
}

const prerelease = core.version.includes('-');
let blocked = false;
for (const pkg of packages) {
  const exists = tryRun('npm', ['view', pkg.name, 'name']);
  if (!exists.ok && /E404|404 Not Found/.test(exists.out)) {
    console.log(`::notice::${pkg.name} isn't on npm yet: publish ${pkg.version} by hand once (CONTRIBUTING.md, "Releasing"), then set up Trusted Publishing`);
    blocked = true;
    continue;
  }
  if (!exists.ok) throw new Error(`npm view ${pkg.name} failed:\n${exists.out}`);

  const published = tryRun('npm', ['view', `${pkg.name}@${pkg.version}`, 'version']).out === pkg.version;
  if (published) {
    say(`${pkg.name}@${pkg.version} is already on npm`);
  } else if (blocked) {
    // A dependency wasn't published: this one would install broken
    console.log(`::warning::${pkg.name}@${pkg.version} not published: a package it depends on isn't on npm yet`);
    continue;
  } else {
    say(`publishing ${pkg.name}@${pkg.version}${prerelease ? ' (npm tag next)' : ''}`);
    const args = ['publish', ...(prerelease ? ['--tag', 'next'] : []), ...(dryRun ? ['--dry-run'] : [])];
    run('npm', args, { cwd: join(root, 'packages', pkg.dir), stdio: 'inherit' });
  }

  // Tag + release for the version now on npm, once
  const tagged = run('git', ['ls-remote', '--tags', 'origin', `refs/tags/${pkg.tag}`]) !== '';
  if (tagged) continue;
  say(`tagging ${pkg.tag} with a GitHub Release`);
  if (dryRun) continue;
  run('gh', [
    'release', 'create', pkg.tag,
    '--target', process.env.GITHUB_SHA ?? run('git', ['rev-parse', 'HEAD']),
    '--title', `${pkg.name} ${pkg.version}`,
    '--notes', `npm: https://www.npmjs.com/package/${pkg.name}/v/${pkg.version}`,
    ...(prerelease ? ['--prerelease'] : []),
  ], { stdio: 'inherit' });
}
