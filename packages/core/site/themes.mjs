// What core's own sites (its Storybook and brand kit) know about the rest of
// this folder: the themes built on core, and the host's settings.
//
// A theme is any package next to core with a theme.json. Its card shows:
//   theme.json "name"       the theme's name
//   theme.json "tagline"    one line on what it's for
//   theme.json "monogram"   optional: the theme's monogram (SVG, filled paths), a path in its package
//   theme.json "simplifiedMonogram"  optional: its heavy-stroke version for small sizes
//   theme.json "emblem"     optional: a module in its package (not in npm) whose
//                           emblem({ monogram, colors }) draws the card's picture
//                           from the monogram in a mood's colors (an SVG string),
//                           e.g. Ninefold presses it into its wax seal. Without one,
//                           a theme with a monogram gets its app icon's picture: the
//                           monogram on its accent plate, in its corner shape
//   theme.json "moods"      the two mood names
//   tokens/themes/*.json    a few colors of each mood, resolved from its own tokens
// Each theme's Storybook and kit sit one folder down from core's, at /<package folder>/.
//
// A host can add its own settings (the same package Storybook reads for its
// mark: STORYBOOK_IDENTITY, default "@rnine/identity", "storybook" field):
//   "mark", "simplifiedMark"   the mark core's sites draw
//   "icons"                    folder with favicon.svg (and apple-touch-icon.png)
//   "brandUrl"                 where the brand kits are hosted (core's at the root, each theme's at /<id>/)
//   "docsUrl"                  where the Storybooks are hosted (the same layout)
//   "formerRoot"               the theme that used to be at the root: old links to it are sent on
//   "themes": { "<id>": { "monogram": "assets/x.svg", "simplifiedMonogram": "assets/x-small.svg" } }
//                              a monogram the host keeps for a theme
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { markParts, plateSvg } from '../src/pages/plate.ts';

const here = dirname(fileURLToPath(import.meta.url));
const packagesDir = join(here, '..', '..');
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

/** Looks a dotted path up in a token tree and follows {references} to a value. */
function resolve(tree, value, seen = new Set()) {
  if (typeof value !== 'string' || !/^\{[^}]+\}$/.test(value)) return value;
  const path = value.slice(1, -1);
  if (seen.has(path)) throw new Error(`Token reference loop at ${path}`);
  seen.add(path);
  const node = path.split('.').reduce((at, key) => at?.[key], tree);
  if (node?.$value === undefined) throw new Error(`No token ${path}`);
  return resolve(tree, node.$value, seen);
}

/** Every token file of a theme, as one tree. */
function tokenTree(packageDir) {
  const tokens = join(packageDir, 'tokens');
  const tree = {};
  for (const file of readdirSync(tokens).filter((f) => f.endsWith('.json'))) Object.assign(tree, readJson(join(tokens, file)));
  return tree;
}

/** The theme's corner rule (shape.cut and shape.round, multiples of a corner size). */
export function shapeRule(packageDir) {
  const tree = tokenTree(packageDir);
  return { cut: Number(resolve(tree, tree.shape?.cut?.$value ?? 0)), round: Number(resolve(tree, tree.shape?.round?.$value ?? 0)) };
}

/**
 * The card picture of a theme that doesn't draw its own: its monogram on its
 * accent plate in its corner shape, as its app icon (in a mood's colors).
 */
export function plateEmblem({ monogram, colors, shape }) {
  return plateSvg({ mark: markParts(monogram), accent: colors.accent, onAccent: colors['on-accent'], cut: shape.cut, round: shape.round });
}

/** A mood's main colors (bg, surface, fg, accent, signal, line), resolved. */
export function moodColors(packageDir, scheme) {
  const tree = tokenTree(packageDir);
  const roles = readJson(join(packageDir, 'tokens', 'themes', `${scheme}.json`)).theme;
  const out = {};
  for (const role of ['bg', 'surface', 'fg', 'fg-muted', 'line', 'accent', 'accent-text', 'on-accent', 'signal', 'wax', 'wax-light', 'wax-dark']) {
    if (roles[role]) out[role] = String(resolve(tree, roles[role].$value)).slice(0, 7);
  }
  return out;
}

function host() {
  const name = process.env.STORYBOOK_IDENTITY ?? '@rnine/identity';
  let manifest;
  try {
    manifest = createRequire(import.meta.url).resolve(`${name}/package.json`);
  } catch {
    return { root: undefined, config: {} };
  }
  return { root: dirname(manifest), config: readJson(manifest).storybook ?? {} };
}

const trailing = (url) => (url ? url.replace(/\/?$/, '/') : undefined);

/** The themes next to core, and the host's settings, for core's sites. */
export function loadSite() {
  const { root, config } = host();
  const read = (file) => (root && file ? readFileSync(join(root, file), 'utf8') : undefined);

  const themes = readdirSync(packagesDir)
    .filter((dir) => dir !== 'core' && existsSync(join(packagesDir, dir, 'theme.json')) && existsSync(join(packagesDir, dir, 'package.json')))
    .map((dir) => {
      const packageDir = join(packagesDir, dir);
      const theme = readJson(join(packageDir, 'theme.json'));
      const manifest = readJson(join(packageDir, 'package.json'));
      const own = (file) => (file ? readFileSync(join(packageDir, file), 'utf8') : undefined);
      const hosted = config.themes?.[dir] ?? {};
      const monogram = read(hosted.monogram) ?? own(theme.monogram) ?? null;
      const monogramSimplified = (hosted.monogram ? read(hosted.simplifiedMonogram) : own(theme.simplifiedMonogram)) ?? null;
      const colors = { light: moodColors(packageDir, 'light'), dark: moodColors(packageDir, 'dark') };
      // The card's picture, drawn from the monogram: the theme's own (a sync require: Node loads ES
      // modules and TypeScript), else its app icon's
      let emblem = null;
      if (theme.emblem && monogram) {
        const draw = createRequire(import.meta.url)(join(packageDir, theme.emblem)).emblem;
        emblem = { light: draw({ monogram, colors: colors.light }), dark: draw({ monogram, colors: colors.dark }) };
      } else if (monogram) {
        const shape = shapeRule(packageDir);
        emblem = { light: plateEmblem({ monogram, colors: colors.light, shape }), dark: plateEmblem({ monogram, colors: colors.dark, shape }) };
      }
      return {
        id: dir,
        name: theme.name,
        package: manifest.name,
        version: manifest.version,
        tagline: theme.tagline ?? '',
        moods: {
          light: { label: theme.moods.light.label, description: theme.moods.light.description ?? '' },
          dark: { label: theme.moods.dark.label, description: theme.moods.dark.description ?? '' },
        },
        colors,
        monogram,
        monogramSimplified,
        emblem,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const icons = root && config.icons ? join(root, config.icons) : join(here, 'static');
  return {
    themes,
    mark: config.mark ? { full: read(config.mark), simplified: read(config.simplifiedMark) } : null,
    icons,
    appleTouchIcon: existsSync(join(icons, 'apple-touch-icon.png')),
    brandUrl: trailing(config.brandUrl) ?? null,
    docsUrl: trailing(config.docsUrl) ?? null,
    formerRoot: themes.some((t) => t.id === config.formerRoot) ? config.formerRoot : null,
  };
}
