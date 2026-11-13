#!/usr/bin/env node
// Publishes the libraries whose version on main isn't on npm yet, core first,
// and tags each version that's on npm (core@0.2.0, nineos@0.2.0, ninefold@0.2.0) with a GitHub
// Release. Run by .github/workflows/publish.yml after build, test and smoke.
//
//   node scripts/publish.mjs              publish + tag (CI: npm Trusted Publishing)
//   node scripts/publish.mjs --stage      stage instead, for approval on npm
//   node scripts/publish.mjs --dry-run    say what it would do, change nothing
//
// --stage is for a Trusted Publisher that may only stage ("Allow npm publish"
// unchecked on npmjs.com): a maintainer approves each staged version with 2FA,
// core first, on npmjs.com or with npm stage approve, and the next run of this
// script tags it.
//
// A release is a version bump: every package shares one version (each library
// pins core to it exactly), changed together in one commit (yarn release:version).
// A version with a hyphen (0.3.0-beta.1) goes out under the npm tag "next".
//
// A package that has never been on npm is skipped: npm Trusted Publishing can
// only be set up for a package that exists, so its first version is published
// by hand (see CONTRIBUTING.md).
import { spawnSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');
const stageMode = process.argv.includes('--stage');
const inCI = process.env.GITHUB_ACTIONS === 'true';
const ORDER = ['core', 'nineos', 'ninefold']; // dependencies first

// Runs a command and returns its exit status and both output streams. On
// Windows npm and gh need a shell (npm is npm.cmd): one quoted command line.
const quote = (a) => (/^[\w@./:=-]+$/.test(a) ? a : `"${a.replace(/"/g, '\\"')}"`);
const exec = (cmd, args, opts = {}) => {
  const options = { cwd: root, encoding: 'utf8', ...opts };
  const result = process.platform === 'win32'
    ? spawnSync([cmd, ...args].map(quote).join(' '), { ...options, shell: true })
    : spawnSync(cmd, args, options);
  if (result.error) throw result.error;
  const out = (result.stdout ?? '').trim();
  const err = (result.stderr ?? '').trim();
  return { ok: result.status === 0, out, err, all: [out, err].filter(Boolean).join('\n') };
};
const run = (cmd, args, opts) => {
  const result = exec(cmd, args, opts);
  if (!result.ok) throw new Error(`${cmd} ${args.join(' ')} failed:\n${result.all}`);
  return result.out;
};
const say = (msg) => console.log(dryRun ? `[dry run] ${msg}` : msg);

// The GitHub job summary: what was released, or what's waiting for approval
const summary = [];
const writeSummary = () => {
  if (!summary.length) return;
  const text = `${summary.join('\n')}\n`;
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
  else console.log(`\n${text}`);
};

const packages = ORDER.map((dir) => {
  const manifest = JSON.parse(readFileSync(join(root, 'packages', dir, 'package.json'), 'utf8'));
  return { dir, manifest, name: manifest.name, version: manifest.version, tag: `${dir}@${manifest.version}` };
});

// One version for all, and every library built on exactly that core
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
const distTag = prerelease ? 'next' : 'latest';

// Is the package on npm at all, and is this version on it?
const npmState = (pkg) => {
  const exists = exec('npm', ['view', pkg.name, 'name']);
  if (!exists.ok && /E404|404 Not Found/.test(exists.all)) return 'missing';
  if (!exists.ok) throw new Error(`npm view ${pkg.name} failed:\n${exists.all}`);
  return exec('npm', ['view', `${pkg.name}@${pkg.version}`, 'version']).out === pkg.version ? 'live' : 'absent';
};

// A staged version can't be published or staged again (staged and published
// versions share one index), and CI's token can't list the stage queue, so a
// conflict here means it's staged and waiting for approval.
const CONFLICT = /cannot publish over|previously published|already (been )?staged|already exists|E409|EPUBLISHCONFLICT/i;

const waiting = []; // staged versions: { pkg, id }
const released = [];

const publish = (pkg) => {
  say(`${stageMode ? 'staging' : 'publishing'} ${pkg.name}@${pkg.version} (npm tag ${distTag})`);
  const args = [
    ...(stageMode ? ['stage', 'publish'] : ['publish']),
    '--tag', distTag,
    ...(inCI ? ['--provenance'] : []),
    ...(dryRun ? ['--dry-run'] : []),
  ];
  const result = exec('npm', args, { cwd: join(root, 'packages', pkg.dir) });
  if (result.all) console.log(result.all);
  if (result.ok) {
    if (stageMode && !dryRun) waiting.push({ pkg, id: /staged with id ([\w-]+)/i.exec(result.all)?.[1] });
    return stageMode ? 'staged' : 'published';
  }
  if (CONFLICT.test(result.all)) {
    console.log(`::notice::${pkg.name}@${pkg.version} is already staged, waiting for approval on npm`);
    waiting.push({ pkg });
    return 'staged';
  }
  if (!stageMode && /E403|E401|forbidden|stag/i.test(result.all)) {
    console.log("::error::npm refused the publish. If this package's Trusted Publisher only allows staging (\"Allow npm publish\" unchecked on npmjs.com), check that box, or run scripts/publish.mjs with --stage.");
  }
  throw new Error(`npm ${args.join(' ')} failed for ${pkg.name}@${pkg.version}`);
};

// The commit that set this version, so a tag made later still points at the
// release (needs full history: checkout with fetch-depth 0)
const releaseCommit = (pkg) => {
  const found = exec('git', [
    'log', '--reverse', '--format=%H', '-S', `"version": "${pkg.version}"`, '--', `packages/${pkg.dir}/package.json`,
  ]);
  const first = found.ok ? found.out.split('\n')[0] : '';
  return first || process.env.GITHUB_SHA || run('git', ['rev-parse', 'HEAD']);
};

const tag = (pkg) => {
  if (run('git', ['ls-remote', '--tags', 'origin', `refs/tags/${pkg.tag}`]) !== '') return;
  const target = releaseCommit(pkg);
  say(`tagging ${pkg.tag} at ${target.slice(0, 7)} with a GitHub Release`);
  if (dryRun) return;
  run('gh', [
    'release', 'create', pkg.tag,
    '--target', target,
    '--title', `${pkg.name} ${pkg.version}`,
    '--notes', `npm: https://www.npmjs.com/package/${pkg.name}/v/${pkg.version}`,
    ...(prerelease ? ['--prerelease'] : []),
  ], { stdio: 'inherit' });
};

let blocked = false;
for (const pkg of packages) {
  const state = npmState(pkg);
  if (state === 'missing') {
    console.log(`::notice::${pkg.name} isn't on npm yet: publish ${pkg.version} by hand once (CONTRIBUTING.md, "Releasing"), then set up Trusted Publishing`);
    blocked = true;
    continue;
  }
  if (state === 'live') {
    say(`${pkg.name}@${pkg.version} is on npm`);
    tag(pkg);
    continue;
  }
  if (blocked) {
    // A dependency isn't on npm at all: this one would install broken
    console.log(`::warning::${pkg.name}@${pkg.version} not published: a package it depends on isn't on npm yet`);
    continue;
  }
  if (publish(pkg) === 'published') {
    released.push(pkg);
    tag(pkg);
  }
}

if (released.length && !dryRun) {
  summary.push(`## Released ${core.version}`, '');
  for (const pkg of released) {
    summary.push(`- [${pkg.name}@${pkg.version}](https://www.npmjs.com/package/${pkg.name}/v/${pkg.version}), tagged \`${pkg.tag}\``);
  }
}
if (waiting.length) {
  summary.push(
    `## Approve ${core.version} on npm`,
    '',
    'Staged versions go live only when a maintainer approves them (2FA). Approve **core first**, then the libraries, on npmjs.com (account settings → Staged Packages) or from a terminal:',
    '',
    '```bash',
    ...waiting.map(({ pkg, id }) => (id
      ? `npm stage approve ${id}   # ${pkg.name}@${pkg.version}`
      : `npm stage list ${pkg.name}   # then: npm stage approve <stage-id>`)),
    '```',
    '',
    'Then run Publish again (Actions → Publish → Run workflow) to tag them.',
  );
}
writeSummary();
