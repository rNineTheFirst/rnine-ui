#!/usr/bin/env node
// Installs the packed libraries in a throwaway app, the way someone using them
// from npm would, and checks the app type-checks and builds: a broken
// "exports" map, a file missing from "files", a type that imports something
// that isn't a dependency, or a subpath that doesn't resolve fails here, before
// anything is published.
//
//   yarn build && node scripts/smoke.mjs     (yarn smoke)
//
// Needs the network (npm install). The app is made in the system temp folder
// and removed afterwards (--keep leaves it, for a look).
import { execFileSync, execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const keep = process.argv.includes('--keep');
const manifest = (name) => JSON.parse(readFileSync(join(root, 'packages', name, 'package.json'), 'utf8'));
const core = manifest('core');
const nineos = manifest('nineos');
const ninefold = manifest('ninefold');

// npm on Windows is npm.cmd, which only runs through a shell: one command
// string, each argument quoted (they're this script's own, paths included)
const line = (cmd, args) => [cmd, ...args.map((a) => (/^[\w@./:=-]+$/.test(a) ? a : `"${a}"`))].join(' ');
const npm = (args, cwd) => execSync(line('npm', args), { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
const npx = (args, cwd) => execSync(line('npx', ['--no-install', ...args]), { cwd, stdio: 'inherit' });

const tmp = mkdtempSync(join(tmpdir(), 'rnine-ui-smoke-'));
try {
  // The same tarballs npm publish would upload
  const tarballs = {};
  for (const name of ['core', 'nineos', 'ninefold']) {
    const [packed] = JSON.parse(npm(['pack', '--json', '--pack-destination', tmp], join(root, 'packages', name)));
    tarballs[packed.name] = `file:../${packed.filename}`;
    console.log(`packed ${packed.name}@${packed.version}: ${(packed.size / 1024).toFixed(0)} kB, ${packed.entryCount} files`);
  }

  // Dev tool versions come from the libraries' own, so the app matches what they're built with
  const dev = nineos.devDependencies;
  const app = join(tmp, 'app');
  mkdirSync(join(app, 'src'), { recursive: true });
  const files = {
    'package.json': JSON.stringify(
      {
        name: 'smoke-app',
        private: true,
        type: 'module',
        dependencies: { ...tarballs, react: dev.react, 'react-dom': dev['react-dom'] },
        devDependencies: Object.fromEntries(
          ['@types/react', '@types/react-dom', '@vitejs/plugin-react', 'sass', 'typescript', 'vite'].map((d) => [d, dev[d]]),
        ),
        // the libraries depend on @rnine/core by version: point that at the tarball too
        overrides: { '@rnine/core': '$@rnine/core' },
      },
      null,
      2,
    ),
    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        // the libraries' own .d.ts files are checked too
        skipLibCheck: false,
        types: ['vite/client'],
      },
      include: ['src'],
    }),
    'vite.config.js': "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n",
    'index.html': '<!doctype html><html><head><meta charset="utf-8"><title>smoke</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n',
    // Every public subpath, from every library
    'src/main.tsx': `import '@rnine/nineos/fonts.css';
import '@rnine/nineos/styles.css';
import '@rnine/core/fonts.css';
import '@rnine/core/base.css';
import '@rnine/core/components.css';
import { createRoot } from 'react-dom/client';
import { Button, Card, CommandLine, ThemeProvider, brandOf, useMood, type Brand } from '@rnine/nineos';
import { Backdrop, TextReveal, swapIn } from '@rnine/nineos/motion';
import { tokens } from '@rnine/nineos/tokens';
import * as plain from '@rnine/core';
import * as kit from '@rnine/core/kit';
import { tokens as plainTokens } from '@rnine/core/tokens';
import { statusPage, type StatusPageOptions } from '@rnine/nineos/pages';
import { emailLayout } from '@rnine/core/pages';
import '@rnine/ninefold/fonts.css';
import '@rnine/ninefold/styles.css';
import { Card as FoldCard, LanternTrail, MoonDial, NINEFOLD_THEME, type TrailStop } from '@rnine/ninefold';
import { HeroLight, Ink, swapOut as swarmOut } from '@rnine/ninefold/motion';
import { tokens as ninefoldTokens } from '@rnine/ninefold/tokens';
import { statusPage as ninefoldPage } from '@rnine/ninefold/pages';
import styles from './app.module.scss';

const github: Brand | null = brandOf('github.com/someone');
const stops: TrailStop[] = [{ id: 'a', label: NINEFOLD_THEME.moods.light.label }, { id: 'b', label: String(ninefoldTokens.name) }];

function App() {
  const { scheme, setMood } = useMood();
  return (
    <Card className={styles.card}>
      <Backdrop />
      <TextReveal text={\`\${scheme} \${github?.name ?? ''}\`} />
      <Button onClick={() => setMood('dark')}>Dark</Button>
      <CommandLine commands={[]} onRun={() => {}} />
      <plain.Button>{String(Object.keys(kit).length + Object.keys(tokens).length + Object.keys(plainTokens).length)}</plain.Button>
      <FoldCard>
        <HeroLight />
        <Ink hint={false} />
        <LanternTrail label="Sections" stops={stops} onChange={() => {}} />
        <MoonDial />
      </FoldCard>
    </Card>
  );
}

void [swapIn, swarmOut, ninefoldPage];
const page: StatusPageOptions = { title: 't', label: 'l', heading: 'h', paragraphs: [], status: { text: 's' } };
void [statusPage(page), emailLayout({ eyebrow: 'e', title: 't', preheader: 'p', body: '', footer: '' })];
createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);
`,
    'src/app.module.scss': `@use '@rnine/nineos/scss' as r9;
@use '@rnine/ninefold/scss' as nf;

.card {
  @include r9.type(body);
  @include r9.corner(md);
  @include r9.hairline;
  @include r9.focus-ring;
  @include r9.down(md) {
    @include r9.texture(field);
  }
}

.note {
  @include nf.card-corner(lg);
  @include nf.pen-underline;
  color: nf.$wax;
}
`,
    // The token tool and the conformance checks load in plain Node
    'node-check.mjs': `const { buildTokens } = await import('@rnine/core/build-tokens');
const conformance = await import('@rnine/core/conformance');
const theme = (await import('@rnine/nineos/theme.json', { with: { type: 'json' } })).default;
const ninefoldTheme = (await import('@rnine/ninefold/theme.json', { with: { type: 'json' } })).default;
if (typeof buildTokens !== 'function' || !Object.keys(conformance).length || !theme || !ninefoldTheme) process.exit(1);
// Static pages run outside the browser (Workers, servers): no React, no DOM
for (const lib of ['@rnine/core/pages', '@rnine/nineos/pages', '@rnine/ninefold/pages']) {
  const { statusPage, markIcon } = await import(lib);
  const html = statusPage({ title: 't', label: 'l', heading: 'h', paragraphs: [], status: { text: 's' } });
  if (!html.startsWith('<!doctype html>') || !markIcon({ mark: { viewBox: '0 0 1 1', paths: '' } }).startsWith('<svg')) process.exit(1);
}
console.log('node: build-tokens, conformance, theme.json and every pages entry load');
`,
  };
  for (const [file, text] of Object.entries(files)) writeFileSync(join(app, file), text);

  console.log('installing the tarballs in a new app...');
  npm(['install', '--no-audit', '--no-fund', '--loglevel=error'], app);
  console.log('type-checking...');
  npx(['tsc', '-p', '.'], app);
  console.log('building...');
  npx(['vite', 'build', '--logLevel', 'warn'], app);
  execFileSync(process.execPath, ['node-check.mjs'], { cwd: app, stdio: 'inherit' });
  console.log(`smoke: @rnine/core@${core.version}, @rnine/nineos@${nineos.version} and @rnine/ninefold@${ninefold.version} install, type-check and build`);
} finally {
  if (keep) console.log(`kept: ${tmp}`);
  else rmSync(tmp, { recursive: true, force: true });
}
