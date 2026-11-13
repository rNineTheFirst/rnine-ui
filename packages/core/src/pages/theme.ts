// What static pages read from a library's built tokens (its "<library>/tokens"
// export), and small helpers over it. No React, no DOM: runs in Workers and Node.
import type { AutoRule, MoodNames, Scheme } from '../hooks/moodBoot';

export type TokenEntry = { name: string; cssVar: string; value: string | number; type?: string; ref?: string; description?: string };

/** A font file static pages and emails serve themselves (theme.json "fonts"). */
export type PageFont = {
  /** The name it's served as: <fontsUrl><id>.woff2 */
  id: string;
  family: string;
  /** A weight or a range for a variable font ("100 900") */
  weight: string;
  style: string;
  /** The woff2 file, as a package path (e.g. @fontsource/x/files/x-latin-400-normal.woff2) */
  src: string;
};

/** The parts of a library's built tokens (tokens.js) static pages use. */
export type PageTokens = {
  name: string;
  moods: MoodNames;
  auto: AutoRule;
  groups: Record<string, readonly TokenEntry[]>;
  schemes: Record<Scheme, readonly TokenEntry[]>;
  typeRoles: readonly { name: string; fontFamily: string; fontWeight: string | number }[];
  palettes?: readonly { id: string; label: string; default?: boolean; schemes: Record<Scheme, readonly TokenEntry[]> }[];
  fonts?: readonly PageFont[];
};

/**
 * A library, as static pages see it: its tokens, its stylesheet for them
 * (tokens.css plus core's page styles, then anything of its own), and the
 * inline script of its title effect (the TextReveal role; none: the title
 * shows as it is).
 */
export type PageTheme = {
  tokens: PageTokens;
  /** The CSS every static page inlines. */
  css: string;
  /** Inline JS run on status pages: animates h1[data-reveal]. It must check reduced motion itself. */
  reveal?: string;
};

/** The palette id to use: the one asked for if the library has it, else none (the default). */
export function paletteId(tokens: PageTokens, palette?: string | null): string | undefined {
  if (!palette || !tokens.palettes?.length) return undefined;
  const found = tokens.palettes.find((p) => p.id === palette);
  return found && !found.default ? found.id : undefined;
}

/** Every mood role's value in one scheme and palette: { bg: '#FFFFFF', accent: ..., ... } */
export function roleValues(tokens: PageTokens, { scheme = 'light', palette }: { scheme?: Scheme; palette?: string | null } = {}): Record<string, string> {
  const id = paletteId(tokens, palette);
  const list = (id && tokens.palettes?.find((p) => p.id === id)?.schemes[scheme]) || tokens.schemes[scheme];
  return Object.fromEntries(list.map((r) => [r.name, String(r.value)]));
}

/** A token's value by group and name (e.g. 'shape', 'shape-cut'). */
export function tokenValue(tokens: PageTokens, group: string, name: string): string {
  const found = tokens.groups[group]?.find((t) => t.name === name);
  if (!found) throw new Error(`${tokens.name}: no token ${name} in ${group}`);
  return String(found.value);
}

/** The library's corner rule: how much of a corner size it cuts and rounds (multiples). */
export function shape(tokens: PageTokens) {
  return { cut: Number(tokenValue(tokens, 'shape', 'shape-cut')), round: Number(tokenValue(tokens, 'shape', 'shape-round')) };
}

/** The font stacks: display, body and mono. */
export function fontStacks(tokens: PageTokens) {
  return {
    display: tokenValue(tokens, 'font', 'font-display'),
    body: tokenValue(tokens, 'font', 'font-body'),
    mono: tokenValue(tokens, 'font', 'font-mono'),
  };
}

/** @font-face rules for the library's page fonts, served from fontsUrl (ending in /). */
export function fontFaces(tokens: PageTokens, fontsUrl: string, quote = '"'): string {
  return (tokens.fonts ?? [])
    .map(
      (f) =>
        `@font-face{font-family:${quote}${f.family}${quote};src:url(${quote}${fontsUrl}${f.id}.woff2${quote}) format(${quote}woff2${quote});` +
        `font-weight:${f.weight};font-style:${f.style};font-display:swap}`,
    )
    .join('');
}

/** The page font that draws a type role's first family at its weight, if the library serves one. */
export function fontFor(tokens: PageTokens, role: string): PageFont | undefined {
  const type = tokens.typeRoles.find((r) => r.name === role);
  if (!type) return undefined;
  const family = type.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
  const weight = Number(type.fontWeight);
  return (tokens.fonts ?? []).find((f) => {
    if (f.family !== family) return false;
    const [lo, hi = lo] = f.weight.split(/\s+/).map(Number);
    return weight >= lo && weight <= hi;
  });
}
