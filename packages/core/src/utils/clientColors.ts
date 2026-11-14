// Client colors: a client's brand color (and, when it fails, a second color
// per mood) turned into the accent roles, with checks that say what passes
// and what doesn't. The rule: a client's color is never changed to make it
// pass. When it fails, the checks say so and suggest a color to ask the
// client for; until they give one, the suggestion stands in so the app stays
// readable.
import type { Scheme } from '../hooks/mood';
import { contrastRatio, hexToHsl, hslToHex, hueDistance, luminance, mixHex, parseHex } from './color';

/** The thresholds the checks use. */
export const CLIENT_COLOR_RULES = {
  /** Text and links in the client color, on the page and on cards (WCAG AA). */
  text: 4.5,
  /** Button text on the button color (WCAG AA). */
  buttonText: 4.5,
  /** A button's fill against the page (WCAG non-text contrast). Below it, buttons use the text color. */
  fill: 3,
  /** The pale tone against cards, so marks and highlights still show. */
  pale: 1.3,
  /** How close, in hue degrees, a saturated brand color may sit to the error red or success green. */
  statusHue: 22,
} as const;

/** The client's colors: the brand color as given, and optional second colors for each mood. */
export type ClientColors = {
  brand: string;
  /** Used for text, links and buttons in the light mood when the brand color is too light there. */
  light?: string;
  /** Used for text, links and buttons in the dark mood when the brand color is too dark there. */
  dark?: string;
};

/** The mood's colors the client colors are checked against (its token values). */
export type ClientPage = { bg: string; surface: string; success: string; danger: string };

export type ClientColorCheck = {
  id: 'color' | 'text' | 'fill' | 'button-text' | 'pale' | 'status-hue';
  level: 'ok' | 'warning' | 'error';
  /** One plain sentence: what was checked and what to do. */
  message: string;
  /** The worst contrast ratio found, where the check is a ratio. */
  ratio?: number;
  /** A color that would pass, to ask the client for. */
  suggestion?: string;
};

/** The accent roles client colors produce, by token name (without --r9-). */
export type ClientAccentRoles = {
  accent: string;
  'accent-hover': string;
  'on-accent': string;
  'accent-text': string;
  'accent-soft': string;
  selection: string;
  /** The pale tone: decoration (marks, highlights, washes), never text. */
  pale: string;
};

export type ClientAccent = {
  roles: ClientAccentRoles;
  checks: ClientColorCheck[];
  /** No errors (warnings are allowed). */
  ok: boolean;
  /** Text and links use a suggested color because no passing one was given. */
  usingSuggestion: boolean;
};

const WHITE = '#FFFFFF';
const INK = '#111111';
/** Hues of a generic error red and success green, checked as well as the mood's own. */
const RED = 4;
const GREEN = 145;
/** Below this saturation a color counts as grey (no hue to speak of). */
const GREY = 0.08;

const fix = (n: number) => n.toFixed(1);
const minRatio = (color: string, on: string[]) => Math.min(...on.map((b) => contrastRatio(color, b)));

/** `color` darkened (on a light page) or lightened (on a dark page) just enough to reach `min` on every background. */
export function suggestColor(color: string, on: string[], min: number): string {
  const dark = luminance(on[0]) > 0.4;
  const toward = dark ? '#000000' : WHITE;
  for (let t = 0; t <= 1; t += 0.02) {
    const c = mixHex(color, toward, t);
    if (minRatio(c, on) >= min) return c;
  }
  return toward;
}

/** The pale tone of a color: its hue, more saturated, light (0.8) in the light mood and mid (0.6) in the dark one. */
export function paleTone(color: string, scheme: Scheme): string {
  const { h, s } = hexToHsl(color);
  const sat = s < GREY ? 0 : Math.min(0.85, Math.max(0.4, s * 1.5));
  return hslToHex({ h, s: sat, l: scheme === 'light' ? 0.8 : 0.6 });
}

/**
 * Checks a client's colors in one mood and returns the accent roles to use
 * there. Checks, in order: text and links (an error below 4.5:1: ask for a
 * second color for this mood), the button fill (a warning below 3:1: buttons
 * use the text color), button text (an error below 4.5:1), the pale tone on
 * cards (a warning below 1.3:1) and the brand hue near the error red or
 * success green (a warning).
 *
 *   const { roles, checks, ok } = clientAccent({ brand: '#F07F13' }, 'light', page);
 */
export function clientAccent(colors: ClientColors, scheme: Scheme, page: ClientPage): ClientAccent {
  const checks: ClientColorCheck[] = [];
  const parsed = parseHex(colors.brand);
  const brand = parsed ?? '#808080';
  if (!parsed) checks.push({ id: 'color', level: 'error', message: `"${colors.brand}" isn't a color: use a hex code such as #2B4D82.` });
  const secondInput = colors[scheme];
  const second = secondInput ? parseHex(secondInput) : null;
  if (secondInput && !second) checks.push({ id: 'color', level: 'error', message: `The ${scheme}-mood second color "${secondInput}" isn't a color: use a hex code.` });

  const onPage = [page.bg, page.surface];
  const R = CLIENT_COLOR_RULES;
  const suggestion = suggestColor(brand, onPage, R.text);
  const word = scheme === 'light' ? 'darker' : 'lighter';
  let text: string;
  let usingSuggestion = false;
  const brandText = minRatio(brand, onPage);
  if (brandText >= R.text) {
    text = brand;
    checks.push({ id: 'text', level: 'ok', ratio: brandText, message: `Text and links can use ${brand} (${fix(brandText)}:1).` });
  } else if (second) {
    const r = minRatio(second, onPage);
    if (r >= R.text) {
      text = second;
      checks.push({ id: 'text', level: 'ok', ratio: r, message: `${brand} reads at ${fix(brandText)}:1, so text and links use the second color ${second} (${fix(r)}:1).` });
    } else {
      text = suggestColor(second, onPage, R.text);
      usingSuggestion = true;
      checks.push({ id: 'text', level: 'error', ratio: r, suggestion: text, message: `The second color ${second} reads at ${fix(r)}:1; text needs ${R.text}:1. Try ${text}.` });
    }
  } else {
    text = suggestion;
    usingSuggestion = true;
    checks.push({
      id: 'text',
      level: 'error',
      ratio: brandText,
      suggestion,
      message: `${brand} reads at ${fix(brandText)}:1 as text here; it needs ${R.text}:1. Ask the client for a ${word} color for the ${scheme} mood, such as ${suggestion}.`,
    });
  }

  const brandFill = minRatio(brand, onPage);
  const fill = brandFill >= R.fill ? brand : text;
  if (brandFill < R.fill) {
    // With a passing second color, buttons taking it is the point of giving one
    const usesSecond = fill === second;
    checks.push({
      id: 'fill',
      level: usesSecond ? 'ok' : 'warning',
      ratio: brandFill,
      message: usesSecond
        ? `${brand} is too faint as a button here (${fix(brandFill)}:1), so buttons use the second color too.`
        : `${brand} is too faint as a button here (${fix(brandFill)}:1; a button needs ${R.fill}:1 against the page). Buttons use ${fill}.`,
    });
  }
  const onAccent = contrastRatio(WHITE, fill) >= contrastRatio(INK, fill) ? WHITE : INK;
  const onRatio = contrastRatio(onAccent, fill);
  const onWord = onAccent === WHITE ? 'white' : 'dark';
  if (onRatio < R.buttonText) {
    checks.push({ id: 'button-text', level: 'error', ratio: onRatio, message: `Button text can't reach ${R.buttonText}:1 on ${fill}: the best is ${fix(onRatio)}:1, with ${onWord} text.` });
  } else {
    checks.push({ id: 'button-text', level: 'ok', ratio: onRatio, message: `Buttons: ${fill} with ${onWord} text (${fix(onRatio)}:1).` });
  }

  const pale = paleTone(brand, scheme);
  const paleRatio = contrastRatio(pale, page.surface);
  if (paleRatio < R.pale) {
    checks.push({ id: 'pale', level: 'warning', ratio: paleRatio, message: `The pale tone ${pale} is faint on cards (${paleRatio.toFixed(2)}:1), so marks and highlights barely show.` });
  }

  const { h, s } = hexToHsl(brand);
  if (s > 0.3) {
    const red = Math.min(hueDistance(h, hexToHsl(page.danger).h), hueDistance(h, RED));
    const green = Math.min(hueDistance(h, hexToHsl(page.success).h), hueDistance(h, GREEN));
    if (red < R.statusHue) {
      checks.push({ id: 'status-hue', level: 'warning', message: 'This color sits close to the error red: statuses keep their words, but avoid it for delete buttons.' });
    } else if (green < R.statusHue) {
      checks.push({ id: 'status-hue', level: 'warning', message: 'This color sits close to the success green: "done" and "in stock" keep their words, but the two can blur at a glance.' });
    }
  }

  const light = scheme === 'light';
  const roles: ClientAccentRoles = {
    accent: fill,
    'accent-hover': mixHex(fill, onAccent === WHITE ? '#000000' : WHITE, 0.14),
    'on-accent': onAccent,
    'accent-text': text,
    'accent-soft': mixHex(page.surface, pale, light ? 0.22 : 0.16),
    selection: mixHex(page.surface, pale, light ? 0.55 : 0.4),
    pale,
  };
  return { roles, checks, ok: !checks.some((c) => c.level === 'error'), usingSuggestion };
}
