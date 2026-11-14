// NineSync's colors, from a client's brand color: core's client-color checks
// (clientAccent) for the accent roles, plus NineSync's own: greys tinted
// toward the brand hue (never at the cost of contrast), the pale mark and its
// tones, and the hover glow. The default tokens are this function's output
// for the default client colors (a test checks), so ClientTheme and the built
// tokens never drift apart.
import { clientAccent, contrastRatio, hexToHsl, hslToHex, mixHex, parseHex, suggestColor } from '@rnine/core';
import type { ClientAccent, ClientColors, Scheme } from '@rnine/core';

/** The colors NineSync starts from: the Sync blue, with its light blue as the dark mood's second color. */
export const DEFAULT_CLIENT_COLORS: ClientColors = { brand: '#2B4D82', dark: '#A2C4F6' };

/** The untinted greys and status colors of each mood. */
export const SYNC_BASE = {
  light: {
    bg: '#F5F5F5', surface: '#FFFFFF', 'surface-raised': '#FFFFFF',
    'fg-strong': '#000000', fg: '#333333', 'fg-muted': '#666666', 'fg-subtle': '#767676',
    line: '#E2E2E2', 'line-strong': '#949494',
    success: '#1D7A43', warning: '#8F5600', danger: '#B3261E',
    'inverse-bg': '#1A1A1A', 'inverse-fg': '#FFFFFF',
  },
  dark: {
    bg: '#111111', surface: '#1A1A1A', 'surface-raised': '#222222',
    'fg-strong': '#FFFFFF', fg: '#E2E2E2', 'fg-muted': '#A9A9A9', 'fg-subtle': '#8A8A8A',
    line: '#2E2E2E', 'line-strong': '#6E6E6E',
    success: '#5CC48A', warning: '#E7B04F', danger: '#F28B82',
    'inverse-bg': '#F2F2F2', 'inverse-fg': '#111111',
  },
} as const;

/** Every color role a client's colors set, by token name (without --r9-). */
export type SyncRoles = Record<string, string>;

export type SyncMood = Omit<ClientAccent, 'roles'> & { roles: SyncRoles };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const minRatio = (c: string, on: string[]) => Math.min(...on.map((b) => contrastRatio(c, b)));
/** `color`, or the nearest color toward black or white that reaches `min` on every background. */
const keep = (color: string, on: string[], min: number) => (minRatio(color, on) >= min ? color : suggestColor(color, on, min));

/** The greys of one mood, tinted toward the brand hue (greys stay grey for a grey brand). */
export function tintedGreys(brand: string, scheme: Scheme): Record<string, string> {
  const g: Record<string, string> = { ...SYNC_BASE[scheme] };
  const { h, s } = hexToHsl(brand);
  if (s < 0.08) return g;
  const light = scheme === 'light';
  const hue = hslToHex({ h, s: clamp(s, 0.35, 0.7), l: 0.5 });
  g.bg = mixHex(g.bg, hue, light ? 0.05 : 0.06);
  g.surface = mixHex(g.surface, hue, light ? 0.012 : 0.04);
  g['surface-raised'] = mixHex(g['surface-raised'], hue, light ? 0 : 0.04);
  g.line = mixHex(g.line, hue, light ? 0.1 : 0.12);
  const page = [g.bg, g.surface];
  g['line-strong'] = keep(mixHex(g['line-strong'], hue, 0.1), page, 3);
  g['fg-muted'] = keep(mixHex(g['fg-muted'], hue, 0.12), [...page, g['surface-raised']], 4.5);
  g['fg-subtle'] = keep(mixHex(g['fg-subtle'], hue, 0.12), [g.bg], 3);
  return g;
}

/** One mood's roles and checks. */
export function syncMood(colors: ClientColors, scheme: Scheme): SyncMood {
  const light = scheme === 'light';
  const g = tintedGreys(parseHex(colors.brand) ?? '#808080', scheme);
  const { roles: a, ...result } = clientAccent(colors, scheme, { bg: g.bg, surface: g.surface, success: g.success, danger: g.danger });
  const pale = a.pale;
  const roles: SyncRoles = {
    ...g,
    glass: `${g.surface}E6`,
    accent: a.accent,
    'accent-hover': a['accent-hover'],
    'accent-text': a['accent-text'],
    'on-accent': a['on-accent'],
    'accent-soft': a['accent-soft'],
    // Live states are the success green: the synced dot
    signal: g.success,
    'signal-text': g.success,
    // NineSync's mark: the pale tone under titles, tabs and links, and its shades
    mark: pale,
    'mark-strong': mixHex(pale, a['accent-text'], 0.35),
    'mark-line': mixHex(g.surface, pale, light ? 0.9 : 0.6),
    'mark-soft': mixHex(g.surface, pale, light ? 0.5 : 0.35),
    // The Sync glow: grey layers in the light mood, the pale tone in the dark one (translucent: it spreads over the page)
    glow: light ? '#0000001A' : `${pale}59`,
    'glow-faint': light ? '#00000012' : `${pale}2E`,
    dot: light ? '#0000000F' : '#FFFFFF0F',
    scan: '#00000000',
    sheen: '#FFFFFF00',
    selection: a.selection,
    'scrollbar-thumb': g['line-strong'],
    'scrollbar-thumb-hover': g['fg-subtle'],
  };
  return { ...result, roles };
}

/** Both moods' roles and checks. `ok` when neither mood has an error. */
export function syncColors(colors: ClientColors = DEFAULT_CLIENT_COLORS): { light: SyncMood; dark: SyncMood; ok: boolean } {
  const light = syncMood(colors, 'light');
  const dark = syncMood(colors, 'dark');
  return { light, dark, ok: light.ok && dark.ok };
}

const block = (selector: string, roles: SyncRoles, indent = '') =>
  `${indent}${selector} {\n${Object.entries(roles)
    .map(([k, v]) => `${indent}  --r9-${k}: ${v};`)
    .join('\n')}\n${indent}}`;

/**
 * The CSS that puts a client's colors on the page: both moods' roles, for
 * `scope` (default :root; a preview can pass its own element's selector, with
 * data-scheme on that element).
 */
export function clientThemeCss(colors: ClientColors, scope = ':root'): string {
  const { light, dark } = syncColors(colors);
  return [
    block(`${scope}[data-scheme="light"], ${scope}:not([data-scheme])`, light.roles),
    `@media (prefers-color-scheme: dark) {\n${block(`${scope}:not([data-scheme])`, dark.roles, '  ')}\n}`,
    block(`${scope}[data-scheme="dark"]`, dark.roles),
  ].join('\n\n');
}
