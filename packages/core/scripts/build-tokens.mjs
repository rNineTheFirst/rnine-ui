// The token build tool every library uses (import "@rnine/core/build-tokens").
// It turns a library's DTCG tokens into:
//   <out>/tokens.css       CSS custom properties (--r9-*), light/dark switching
//   <out>/_variables.scss  SCSS variables pointing at those properties, plus maps
//   <out>/tokens.js        the same data for JS (docs, previews, static pages), + tokens.d.ts;
//                          it also exports `css`, tokens.css as text
//
// A library folder has:
//   theme.json                  { name, moods: { light: { id, label }, dark: { id, label } }, auto }
//                               optional "fonts": [{ id, family, weight, style?, src }], the woff2
//                               files static pages and emails serve themselves (src: a package path)
//                               optional "tagline" (one line on what it's for), "monogram" and
//                               "simplifiedMonogram" (package paths to SVGs with filled paths) and
//                               "emblem" (a module drawing the card's picture from the monogram):
//                               core's sites show them on the theme's card (core/site/themes.mjs)
//   tokens/*.json               primitives and scales
//   tokens/themes/light.json    the light mood's roles (one "theme" group)
//   tokens/themes/dark.json     the dark mood's roles, the same names
//   tokens/palettes/<id>.json   optional: other palettes, picked with data-palette="<id>"
//
// A palette swaps some color primitives (its "color" group) and may give new
// values to mood roles that aren't made from primitives, such as tints with
// alpha (its "themes": { light, dark }, the same roles in both). The default
// palette is the primitives as they are, named by theme.json's "palette":
// { id, label }. Every palette, the default too, gets a [data-palette] block,
// so a preview of one palette can sit inside a page showing another. Put
// data-palette on <html>, or on an element that also has data-scheme.
//
// Pass `contract` (core's built tokens) to check that the library defines every
// token core components read: the same scales and roles. Color primitives are
// the library's own (components only use roles).
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** The shared custom property prefix of every library in the family. */
export const PREFIX = 'r9';
export const SCHEMES = ['light', 'dark'];

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const REF = /^\{([^}]+)\}$/;
const ID = /^[a-z][a-z0-9-]*$/;
const TYPO_PARTS = {
  fontFamily: 'font-family',
  fontWeight: 'font-weight',
  fontSize: 'font-size',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
};

/** Walks a DTCG tree and returns tokens: { path[], type, value, description } */
function flatten(node, path = [], inheritedType) {
  const type = node.$type ?? inheritedType;
  if ('$value' in node) return [{ path, type, value: node.$value, description: node.$description }];
  return Object.entries(node)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, child]) => flatten(child, [...path, key], type));
}

/** Reads a library's theme.json: its name, mood names and Auto rule. */
export function readTheme(root) {
  const theme = readJson(join(root, 'theme.json'));
  for (const scheme of SCHEMES) {
    const mood = theme.moods?.[scheme];
    if (!mood?.id || !mood?.label) throw new Error(`theme.json: moods.${scheme} needs an id and a label`);
    if (!ID.test(mood.id)) throw new Error(`theme.json: mood id "${mood.id}": use lowercase letters, digits and -`);
  }
  if (theme.auto !== 'system' && theme.auto !== 'night') throw new Error('theme.json: auto must be "system" or "night"');
  if (theme.palette !== undefined) {
    if (!theme.palette?.id || !theme.palette?.label) throw new Error('theme.json: palette needs an id and a label');
    if (!ID.test(theme.palette.id)) throw new Error(`theme.json: palette id "${theme.palette.id}": use lowercase letters, digits and -`);
  }
  if (theme.fonts !== undefined) {
    if (!Array.isArray(theme.fonts)) throw new Error('theme.json: fonts must be a list');
    for (const font of theme.fonts) {
      const where = `theme.json: font "${font?.id}"`;
      if (!font?.id || !ID.test(font.id)) throw new Error(`${where}: needs an id (lowercase letters, digits and -), the name it's served as`);
      if (!font.family || !font.weight || !font.src) throw new Error(`${where}: needs a family, a weight and a src`);
      if (!String(font.src).endsWith('.woff2')) throw new Error(`${where}: src must be a .woff2 file`);
    }
  }
  return theme;
}

/**
 * Builds the tokens of the library in `root` into `out` (default root/dist).
 * Returns the token data (what tokens.js exports).
 */
export function buildTokens({ root, out = join(root, 'dist'), contract } = {}) {
  const theme = readTheme(root);
  const tokensDir = join(root, 'tokens');
  const base = readdirSync(tokensDir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((f) => flatten(readJson(join(tokensDir, f))));
  const schemes = Object.fromEntries(
    SCHEMES.map((s) => [s, flatten(readJson(join(tokensDir, 'themes', `${s}.json`)))]),
  );
  // Mood tokens drop their "theme" group: theme.bg -> --r9-bg
  for (const list of Object.values(schemes)) for (const t of list) t.path = t.path.slice(1);

  const nameOf = (path) => path.join('-');
  const cssVar = (path) => `--${PREFIX}-${nameOf(path)}`;
  const byRef = new Map(base.map((t) => [t.path.join('.'), t]));

  // Both moods must define the same roles, or one would silently miss a role
  const keys = SCHEMES.map((s) => schemes[s].map((x) => nameOf(x.path)).sort().join(','));
  if (new Set(keys).size !== 1) throw new Error('tokens/themes/light.json and dark.json must define the same roles');

  function resolve(value, refs = byRef, seen = []) {
    if (typeof value === 'string' && REF.test(value)) {
      const ref = value.match(REF)[1];
      if (seen.includes(ref)) throw new Error(`Circular token reference: ${[...seen, ref].join(' -> ')}`);
      const target = refs.get(ref);
      if (!target) throw new Error(`Unknown token reference {${ref}}`);
      return resolve(target.value, refs, [...seen, ref]);
    }
    return value;
  }

  const fontStack = (list) => list.map((f) => (/^[\w-]+$/.test(f) && !/\s/.test(f) ? f : `"${f}"`)).join(', ');

  /** CSS text for a token value; references become var() so moods stay linked to primitives */
  function toCss(value, type) {
    if (typeof value === 'string' && REF.test(value)) return `var(${cssVar(value.match(REF)[1].split('.'))})`;
    if (type === 'fontFamily') return fontStack(value);
    if (type === 'cubicBezier') return `cubic-bezier(${value.join(', ')})`;
    return String(value);
  }

  /** Plain value for JS (references resolved) */
  function toPlain(value, type, refs = byRef) {
    const v = resolve(value, refs);
    if (type === 'fontFamily') return fontStack(v);
    if (type === 'cubicBezier') return `cubic-bezier(${v.join(', ')})`;
    return v;
  }

  function declarations(list) {
    const lines = [];
    for (const t of list) {
      if (t.type === 'typography') {
        for (const [k, prop] of Object.entries(TYPO_PARTS)) {
          lines.push(`  ${cssVar([...t.path, prop])}: ${toCss(t.value[k], k === 'fontFamily' ? 'fontFamily' : 'dimension')};`);
        }
      } else {
        lines.push(`  ${cssVar(t.path)}: ${toCss(t.value, t.type)};`);
      }
    }
    return lines.join('\n');
  }

  // ---- Palettes (optional): tokens/palettes/<id>.json ----
  const palettesDir = join(tokensDir, 'palettes');
  const paletteFiles = existsSync(palettesDir) ? readdirSync(palettesDir).filter((f) => f.endsWith('.json')).sort() : [];
  if (paletteFiles.length && !theme.palette) throw new Error('theme.json: add "palette": { id, label } to name the default palette');
  const roleNames = new Set(schemes.light.map((t) => nameOf(t.path)));

  const others = paletteFiles.map((file) => {
    const id = file.replace(/\.json$/, '');
    const where = `tokens/palettes/${file}`;
    if (!ID.test(id)) throw new Error(`${where}: name the file with lowercase letters, digits and -`);
    if (id === theme.palette.id) throw new Error(`${where}: "${id}" is the default palette's id`);
    const json = readJson(join(palettesDir, file));
    if (!json.label) throw new Error(`${where}: needs a label`);
    const primitives = flatten({ color: json.color ?? {} });
    if (!primitives.length) throw new Error(`${where}: swaps no color primitives`);
    for (const t of primitives) {
      const target = byRef.get(t.path.join('.'));
      if (!target || target.type !== 'color') throw new Error(`${where}: ${t.path.join('.')} is not one of the library's color primitives`);
      if (REF.test(String(t.value))) throw new Error(`${where}: ${t.path.join('.')}: give a color, not a reference`);
    }
    const roles = Object.fromEntries(SCHEMES.map((s) => [s, flatten(json.themes?.[s] ?? {})]));
    const roleKeys = SCHEMES.map((s) => roles[s].map((t) => nameOf(t.path)).sort().join(','));
    if (new Set(roleKeys).size !== 1) throw new Error(`${where}: themes.light and themes.dark must set the same roles`);
    for (const t of roles.light) if (!roleNames.has(nameOf(t.path))) throw new Error(`${where}: ${nameOf(t.path)} is not a mood role`);
    return { id, label: json.label, description: json.description, primitives, roles };
  });

  // What palettes change: the default's block resets exactly these
  const swapped = new Set(others.flatMap((p) => p.primitives.map((t) => t.path.join('.'))));
  const swappedRoles = new Set(others.flatMap((p) => p.roles.light.map((t) => nameOf(t.path))));
  const palettes = others.length
    ? [
        {
          id: theme.palette.id,
          label: theme.palette.label,
          description: theme.palette.description,
          default: true,
          primitives: base.filter((t) => swapped.has(t.path.join('.'))),
          roles: Object.fromEntries(SCHEMES.map((s) => [s, schemes[s].filter((t) => swappedRoles.has(nameOf(t.path)))])),
        },
        ...others,
      ]
    : [];

  /** A palette's view of the tokens: its primitives in, its role values over the mood's */
  function paletteSchemes(p) {
    const refs = new Map(byRef);
    for (const t of p.primitives) refs.set(t.path.join('.'), t);
    const list = Object.fromEntries(
      SCHEMES.map((s) => {
        const own = new Map(p.roles[s].map((t) => [nameOf(t.path), t]));
        return [s, schemes[s].map((t) => own.get(nameOf(t.path)) ?? t)];
      }),
    );
    return { refs, list };
  }

  /** Roles a palette block redeclares: made from a swapped primitive, or given by a palette */
  const touched = (t) => swappedRoles.has(nameOf(t.path)) || (REF.test(String(t.value)) && swapped.has(t.value.match(REF)[1]));

  function paletteCss() {
    if (!palettes.length) return '';
    const sel = (p) => `[data-palette="${p.id}"]`;
    const indent = (text) => text.replace(/^ {2}/gm, '    ');
    const blocks = palettes.map((p) => {
      const { list } = paletteSchemes(p);
      return { p, light: declarations(list.light.filter(touched)), dark: declarations(list.dark.filter(touched)) };
    });
    return `
/* Palettes: data-palette="${palettes.map((p) => p.id).join('|')}" on <html>, or on an element
   that also has data-scheme. ${theme.palette.label} is the default (no attribute). */
${blocks.map(({ p }) => `${sel(p)} {\n${declarations(p.primitives)}\n}`).join('\n\n')}

/* A mood scope inside a palette */
${blocks
  .map(({ p, light: l, dark: d }) => `${sel(p)} [data-scheme="light"] {\n${l}\n}\n\n${sel(p)} [data-scheme="dark"] {\n${d}\n}`)
  .join('\n\n')}

/* The palette's own element (after the scopes above, so a preview of one palette wins inside another) */
${blocks
  .map(
    ({ p, light: l, dark: d }) => `:root${sel(p)},
${sel(p)}[data-scheme="light"] {
${l}
}

@media (prefers-color-scheme: dark) {
  :root${sel(p)}:not([data-scheme="light"]) {
${indent(d)}
  }
}

${sel(p)}[data-scheme="dark"] {
${d}
}`,
  )
  .join('\n\n')}
`;
  }

  const { light, dark } = theme.moods;
  const header = `/* ${theme.name} tokens. Generated by @rnine/core/build-tokens from tokens/*.json. Do not edit. */\n`;
  const css = `${header}
:root {
${declarations(base)}
}

/* ${light.label} (light) is the default */
:root,
[data-scheme="light"] {
${declarations(schemes.light)}
  color-scheme: light;
}

/* Without JavaScript (no data-scheme yet), ${dark.label} follows a dark system setting.
   Apps set data-scheme: the saved choice, or the Auto rule (see useMood). */
@media (prefers-color-scheme: dark) {
  :root:not([data-scheme="light"]) {
${declarations(schemes.dark).replace(/^ {2}/gm, '    ')}
    color-scheme: dark;
  }
}

[data-scheme="dark"] {
${declarations(schemes.dark)}
  color-scheme: dark;
}
${paletteCss()}`;

  const scssVars = (list) =>
    list
      .filter((t) => t.type !== 'typography')
      .map((t) => `$${nameOf(t.path)}: var(${cssVar(t.path)});`)
      .join('\n');

  function scssMap(name, list, valueFrom = (t) => `var(${cssVar(t.path)})`) {
    const rows = list.map((t) => `  "${t.path.at(-1)}": ${valueFrom(t)},`).join('\n');
    return `$${name}: (\n${rows}\n);`;
  }

  const group = (g) => base.filter((t) => t.path[0] === g);
  const typeRoles = group('type');

  const scss = `// ${theme.name} tokens for SCSS. Generated by @rnine/core/build-tokens. Do not edit.
// Every variable points at a CSS custom property, so the mood switches at
// runtime (data-scheme="light" | "dark"). Media queries need plain values: use $breakpoints.

// Primitives and scales
${scssVars(base)}

// Mood roles
${scssVars(schemes.light)}

${scssMap('space', group('space'))}

${scssMap('corner', group('corner'))}

${scssMap('durations', group('duration'))}

${scssMap('easings', group('easing'))}

${scssMap('z-index', group('z'))}

${scssMap('breakpoints', group('breakpoint'), (t) => resolve(t.value))}

$type-roles: (
${typeRoles
  .map((t) => {
    const parts = Object.values(TYPO_PARTS)
      .map((prop) => `"${prop}": var(${cssVar([...t.path, prop])})`)
      .join(', ');
    return `  "${t.path.at(-1)}": (${parts}),`;
  })
  .join('\n')}
);
`;

  const describe = (t, refs = byRef) => ({
    name: nameOf(t.path),
    cssVar: cssVar(t.path),
    type: t.type,
    value: toPlain(t.value, t.type, refs),
    ...(typeof t.value === 'string' && REF.test(t.value) ? { ref: t.value.slice(1, -1) } : {}),
    ...(t.description ? { description: t.description } : {}),
  });

  const groups = {};
  for (const t of base.filter((x) => x.type !== 'typography')) (groups[t.path[0]] ??= []).push(describe(t));

  const data = {
    name: theme.name,
    prefix: PREFIX,
    moods: theme.moods,
    auto: theme.auto,
    groups,
    schemes: Object.fromEntries(SCHEMES.map((s) => [s, schemes[s].map((t) => describe(t))])),
    typeRoles: typeRoles.map((t) => ({
      name: t.path.at(-1),
      cssVarPrefix: cssVar(t.path),
      fontFamily: toPlain(t.value.fontFamily, 'fontFamily'),
      fontWeight: t.value.fontWeight,
      fontSize: t.value.fontSize,
      lineHeight: t.value.lineHeight,
      letterSpacing: t.value.letterSpacing,
      ...(t.description ? { description: t.description } : {}),
    })),
    breakpoints: Object.fromEntries(group('breakpoint').map((t) => [t.path.at(-1), parseInt(resolve(t.value), 10)])),
    // Each palette with its swapped primitives and every mood role as it resolves there (empty: one palette)
    palettes: palettes.map((p) => {
      const { refs, list } = paletteSchemes(p);
      return {
        id: p.id,
        label: p.label,
        ...(p.description ? { description: p.description } : {}),
        default: Boolean(p.default),
        colors: p.primitives.map((t) => describe(t, refs)),
        schemes: Object.fromEntries(SCHEMES.map((s) => [s, list[s].map((t) => describe(t, refs))])),
      };
    }),
    // The font files static pages and emails serve themselves (theme.json "fonts")
    fonts: (theme.fonts ?? []).map(({ id, family, weight, style = 'normal', src }) => ({ id, family, weight: String(weight), style, src })),
  };

  if (contract) {
    const missing = contractProblems(contract, data);
    if (missing.length) throw new Error(`${theme.name} misses tokens core components use:\n  ${missing.join('\n  ')}`);
  }

  const json = JSON.stringify(data, null, 2);
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'tokens.css'), css);
  writeFileSync(join(out, '_variables.scss'), scss);
  // css: tokens.css as text, for pages that inline their styles (@rnine/core/pages)
  writeFileSync(join(out, 'tokens.js'), `// ${theme.name} tokens. Generated by @rnine/core/build-tokens. Do not edit.\nexport const tokens = ${json};\nexport const css = ${JSON.stringify(css)};\nexport default tokens;\n`);
  writeFileSync(join(out, 'tokens.d.ts'), `// Generated. Do not edit.\nexport declare const tokens: ${json};\n/** tokens.css as text. */\nexport declare const css: string;\nexport default tokens;\n`);
  return data;
}

/**
 * What a library's tokens lack against the contract (core's tokens): every
 * scale token (all groups but color primitives), every type role and every
 * mood role. Returns a list of problems, empty when it conforms.
 */
export function contractProblems(contract, data) {
  const names = (d) => new Set([
    ...Object.entries(d.groups).filter(([g]) => g !== 'color').flatMap(([, list]) => list.map((t) => t.name)),
    ...d.typeRoles.map((t) => `type-${t.name}`),
  ]);
  const have = names(data);
  const problems = [...names(contract)].filter((n) => !have.has(n)).map((n) => `--${PREFIX}-${n}`);
  const roles = new Set(data.schemes.light.map((t) => t.name));
  for (const t of contract.schemes.light) if (!roles.has(t.name)) problems.push(`--${PREFIX}-${t.name} (mood role)`);
  if (JSON.stringify(contract.breakpoints) !== JSON.stringify(data.breakpoints)) {
    problems.push(`breakpoints must match core's (${JSON.stringify(contract.breakpoints)}): core components' media queries are compiled with them`);
  }
  return problems;
}
