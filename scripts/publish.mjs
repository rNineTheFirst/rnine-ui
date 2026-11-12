#!/usr/bin/env node
// Stages the libraries whose version on main isn't on npm yet, core first, and
// tags each version that's live on npm (core@0.2.0, nineos@0.2.0) with a
// GitHub Release. Run by .github/workflows/publish.yml after build, test and
// smoke, and by .github/workflows/tag.yml (--tag-only) to tag approved versions.
//
//   node scripts/publish.mjs              stage + tag (CI: npm Trusted Publishing)
//   node scripts/publish.mjs --tag-only   only tag versions that are live on npm
//   node scripts/publish.mjs --dry-run    say what it would do, change nothing
//
// Staged publishing: CI can only stage a version (npm stage publish). It goes
// live when a maintainer approves it on npmjs.com or with npm stage approve
// (2FA), core first. The tag follows on the next run of either workflow.
//
// A release is a version bump: both packages share one version (nineos pins
// core to it exactly), changed together in one commit. A version with a
// hyphen (0.3.0-beta.1) goes out under the npm tag "next", not "latest".
//
// A package that has never been on npm is skipped: npm Trusted Publishing can
// only be set up for a package that exists, so its first version is published
// by hand (see CONTRIBUTING.md).
import { execFileSync, execSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');
const tagOnly = process.argv.includes('--tag-only');
const inCI = process.env.GITHUB_ACTIONS === 'true';
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
const tryRun = (cmd, args, opts) => {
  try {
    return { ok: true, out: run(cmd, args, opts) };
  } catch (error) {
    return { ok: false, out: `${error.stdout ?? ''}${error.stderr ?? ''}`.trim() };
  }
};
const say = (msg) => console.log(dryRun ? `[dry run] ${msg}` : msg);

// The GitHub job summary: what's waiting for approval and how to approve it
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
const distTag = prerelease ? 'next' : 'latest';

// Is the package on npm at all, and is this version live (approved)?
const npmState = (pkg) => {
  const exists = tryRun('npm', ['view', pkg.name, 'name']);
  if (!exists.ok && /E404|404 Not Found/.test(exists.out)) return 'missing';
  if (!exists.ok) throw new Error(`npm view ${pkg.name} failed:\n${exists.out}`);
  return tryRun('npm', ['view', `${pkg.name}@${pkg.version}`, 'version']).out === pkg.version ? 'live' : 'absent';
};

// A version that's already staged can't be staged again (staged and published
// versions share one index), and CI's token can't list the stage queue, so a
// conflict here means it's waiting for approval.
const CONFLICT = /cannot publish over|previously published|already (been )?staged|already exists|E409|EPUBLISHCONFLICT/i;

const stage = (pkg) => {
  say(`staging ${pkg.name}@${pkg.version} (npm tag ${distTag})`);
  const args = ['stage', 'publish', '--tag', distTag, ...(inCI ? ['--provenance'] : []), ...(dryRun ? ['--dry-run'] : [])];
  const result = tryRun('npm', args, { cwd: join(root, 'packages', pkg.dir) });
  if (result.out) console.log(result.out);
  if (result.ok) {
    if (!dryRun) summary.push(`- **${pkg.name}@${pkg.version}** staged, waiting for approval`);
    return true;
  }
  if (CONFLICT.test(result.out)) {
    console.log(`::notice::${pkg.name}@${pkg.version} is already staged, waiting for approval`);
    summary.push(`- **${pkg.name}@${pkg.version}** was already staged, still waiting for approval`);
    return true;
  }
  throw new Error(`npm stage publish failed for ${pkg.name}@${pkg.version}`);
};

// The commit that set this version, so a tag made hours later still points at
// the release (needs full history: checkout with fetch-depth 0)
const releaseCommit = (pkg) => {
  const found = tryRun('git', [
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
let staged = false;
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
  if (tagOnly) {
    say(`${pkg.name}@${pkg.version} isn't live yet (staged and waiting for approval, or not staged): nothing to tag`);
    continue;
  }
  if (blocked) {
    // A dependency isn't on npm at all: this one would install broken
    console.log(`::warning::${pkg.name}@${pkg.version} not staged: a package it depends on isn't on npm yet`);
    continue;
  }
  staged = stage(pkg) || staged;
}

if (staged && !dryRun) {
  summary.unshift(
    `## Approve ${core.version} on npm`,
    '',
    'Staged versions go live only when a maintainer approves them (2FA). Approve **core first**, then the libraries:',
    '',
  );
  summary.push(
    '',
    'On npmjs.com (your avatar → Staged packages), or from a terminal:',
    '',
    '```bash',
    ...packages.flatMap((p) => [`npm stage list ${p.name}`, `npm stage approve <stage-id>   # ${p.name}@${p.version}`]),
    '```',
    '',
    'The Tag releases workflow tags each version once it\'s live (hourly, or run it by hand).',
  );
}
writeSummary();
