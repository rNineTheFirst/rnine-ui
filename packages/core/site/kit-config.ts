// The build every brand kit shares: one page built with relative paths (so it
// works from any host or folder), core's source for every context, and the
// shell's imports pointed at the kit's library.
//
// A library's kit (oss/packages/<id>/kit/vite.config.ts):
//
//   export default defineKit({
//     pkg: <the package folder>,
//     library: { name: '@rnine/<id>', index: <src/index.ts>, motion: <src/motion.ts> },
//     port: 5177,
//   });
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import react from '@vitejs/plugin-react';
import type { Plugin, UserConfig } from 'vite';
import { loadSite } from './themes.mjs';

const coreDir = fileURLToPath(new URL('..', import.meta.url));
const shellDir = join(coreDir, 'site');
const coreSrc = (file: string) => join(coreDir, 'src', file);
const slash = (p: string) => p.replace(/\\/g, '/').toLowerCase();

export type KitOptions = {
  /** The package folder: its kit is <pkg>/kit (core's: site/kit), built to <pkg>/kit/dist. */
  pkg: string;
  /** The library the kit shows. The shell's `@rnine/core` imports become its versions (its Mark, Card...). Core's own kit has none. */
  library?: { name: string; index: string; motion: string };
  /** The kit page's folder. Default: <pkg>/kit. */
  root?: string;
  /** Where it's built. Default: <root>/dist. */
  outDir?: string;
  port: number;
  /** More files to publish next to the page: published path -> its content. */
  downloads?: Record<string, () => string | Uint8Array | Promise<string | Uint8Array>>;
  /** More build-time constants. */
  define?: Record<string, unknown>;
};

/** A story file's entry for links into the Storybook: its title and its first story's id. */
export type StoryEntry = { title: string; id: string };

/** Storybook's id for a title: "Components/ContactIcon" -> "components-contacticon". */
const titleId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/** ... and for an export name, split into words first: "AsLink" -> "as-link". */
const exportId = (name: string) => titleId(name.replace(/([a-z0-9])([A-Z])/g, '$1 $2'));
/** A story's id: "Components/Button" + "AsLink" -> "components-button--as-link". */
export const storyId = (title: string, exportName: string) => `${titleId(title)}--${exportId(exportName)}`;

/** Every story file under a folder: its title and first story (the Storybooks have no docs pages per component). */
export function storyEntries(dir: string): StoryEntry[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return storyEntries(path);
    if (!name.endsWith('.stories.tsx')) return [];
    const source = readFileSync(path, 'utf8');
    // A story file's title has a category ("Components/Button"); other `title:` values don't
    const title = source.match(/\btitle:\s*'([^'/]+\/[^']+)'/)?.[1];
    const first = source.match(/^export const (\w+)\b/m)?.[1];
    return title && first ? [{ title, id: storyId(title, first) }] : [];
  });
}

/** One copy of core (its source) for everyone; the shell gets the kit's library instead. */
function resolveLibraries(library: KitOptions['library']): Plugin {
  const shell = slash(shellDir);
  return {
    name: 'kit-libraries',
    enforce: 'pre',
    resolveId(source, importer) {
      const fromShell = importer && slash(importer).startsWith(shell);
      if (library && fromShell) {
        if (source === '@rnine/core') return library.index;
        if (source === '@rnine/core/motion') return library.motion;
      }
      if (library && source === library.name) return library.index;
      if (library && source === `${library.name}/motion`) return library.motion;
      if (source === '@rnine/core') return coreSrc('index.ts');
      if (source === '@rnine/core/motion') return coreSrc('motion.ts');
      if (source === '@rnine/core/kit') return coreSrc('kit.ts');
      return null;
    },
  };
}

/** The kit's downloads (the package's tokens as CSS and JSON, its theme.json, and more) and the host's favicons. */
function downloads(pkg: string, icons: string, more: KitOptions['downloads'] = {}): Plugin {
  return {
    name: 'kit-downloads',
    async generateBundle() {
      const { tokens } = await import(pathToFileURL(join(pkg, 'dist', 'tokens.js')).href);
      const files: NonNullable<KitOptions['downloads']> = {
        'downloads/tokens.css': () => readFileSync(join(pkg, 'dist', 'tokens.css'), 'utf8'),
        'downloads/tokens.json': () => `${JSON.stringify(tokens, null, 2)}\n`,
        'downloads/theme.json': () => readFileSync(join(pkg, 'theme.json'), 'utf8'),
        ...more,
      };
      for (const [fileName, make] of Object.entries(files)) this.emitFile({ type: 'asset', fileName, source: await make() });
      for (const icon of ['favicon.svg', 'apple-touch-icon.png']) {
        const file = join(icons, icon);
        if (existsSync(file)) this.emitFile({ type: 'asset', fileName: icon, source: readFileSync(file) });
      }
    },
  };
}

export function defineKit(options: KitOptions): UserConfig {
  const root = options.root ?? join(options.pkg, 'kit');
  const site = loadSite();
  const manifest = JSON.parse(readFileSync(join(options.pkg, 'package.json'), 'utf8'));
  return {
    root,
    base: './',
    publicDir: false,
    plugins: [resolveLibraries(options.library), react(), downloads(options.pkg, site.icons, options.downloads)],
    define: Object.fromEntries(
      Object.entries({ __SITE__: site, __VERSION__: manifest.version, __PACKAGE__: manifest.name, ...options.define }).map(([k, v]) => [k, JSON.stringify(v)]),
    ),
    build: { outDir: options.outDir ?? join(root, 'dist'), emptyOutDir: true },
    server: { host: 'localhost', port: options.port, strictPort: true },
  };
}
