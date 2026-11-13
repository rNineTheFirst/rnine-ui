import { escapeHtml } from './status';
import { fontFaces, fontStacks, roleValues, shape, tokenValue, type PageTokens } from './theme';

/**
 * A library's look as an email can carry it. Email clients don't read CSS
 * custom properties, clip-path or (mostly) web fonts, so every value here is
 * resolved: the light mood's colors (inboxes are light), in a palette.
 */
export type EmailTheme = {
  /** Every mood role, resolved: colors.bg, colors.accent, colors['fg-muted'], ... */
  colors: Record<string, string>;
  /** Font stacks, quoted with ' so they fit inside style="..." */
  fonts: { display: string; body: string; mono: string };
  /** Corner radius for buttons and cards ("0" where the library cuts corners) */
  radius: string;
  /** The accent mark's radius: square or round, as the library's ornament */
  ornamentRadius: string;
  /** @font-face rules for clients that load fonts (Apple Mail), from fontsUrl (ending in "/") */
  fontFaces(fontsUrl: string): string;
};

const px = (n: number) => `${Math.round(n * 10) / 10}px`.replace(/^0px$/, '0');

export function emailTheme(tokens: PageTokens, { palette }: { palette?: string | null } = {}): EmailTheme {
  const { round } = shape(tokens);
  const stacks = fontStacks(tokens);
  const single = (stack: string) => stack.replace(/"/g, "'");
  return {
    colors: roleValues(tokens, { scheme: 'light', palette }),
    fonts: { display: single(stacks.display), body: single(stacks.body), mono: single(stacks.mono) },
    radius: px(parseFloat(tokenValue(tokens, 'corner', 'corner-sm')) * round),
    ornamentRadius: round ? `${Math.round(round * 100)}%` : '0',
    fontFaces: (fontsUrl) => fontFaces(tokens, fontsUrl, "'"),
  };
}

export type EmailLayoutOptions = {
  /** Small mono line above the title (plain text) */
  eyebrow: string;
  /** The title, also the document title (plain text) */
  title: string;
  /** The preview line inbox lists show (plain text) */
  preheader: string;
  /** The message, as HTML (inline styles; use emailTheme for its colors) */
  body: string;
  /** One button (plain text label) */
  action?: { label: string; href: string };
  /** Small print at the bottom, as HTML */
  footer: string;
  /** Where the page fonts are served (absolute, ending in "/"). None: the fonts' fallbacks. */
  fontsUrl?: string;
  /** A palette of the library's; the default if it has none by that id. */
  palette?: string | null;
  lang?: string;
};

/** The frame every email shares: eyebrow, title, the body, an action, the footer. Tables and inline styles. */
export function renderEmailLayout(tokens: PageTokens, o: EmailLayoutOptions): string {
  const t = emailTheme(tokens, { palette: o.palette });
  const C = t.colors;
  const F = t.fonts;
  const action = o.action
    ? `<tr><td style="padding:8px 0 0 0;"><a href="${escapeHtml(o.action.href)}" style="display:inline-block;background:${C.accent};color:${C['on-accent']};font:600 15px/1 ${F.body};text-decoration:none;padding:14px 20px;border-radius:${t.radius};">${escapeHtml(o.action.label)} &rarr;</a></td></tr>`
    : '';
  return `<!doctype html>
<html lang="${escapeHtml(o.lang ?? 'en')}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${escapeHtml(o.title)}</title>
<style>${o.fontsUrl ? t.fontFaces(o.fontsUrl) : ''}a{color:${C['accent-text']};}</style></head>
<body style="margin:0;padding:0;background:${C.bg};color:${C.fg};">
<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
<tr><td style="padding:0 0 12px 0;font:400 13px/1 ${F.mono};letter-spacing:.12em;text-transform:uppercase;color:${C['fg-muted']};"><span style="display:inline-block;width:6px;height:6px;background:${C.accent};border-radius:${t.ornamentRadius};margin-right:8px;vertical-align:middle;"></span>${escapeHtml(o.eyebrow)}</td></tr>
<tr><td style="padding:0 0 24px 0;font:600 26px/1.2 ${F.display};color:${C.fg};">${escapeHtml(o.title)}</td></tr>
<tr><td style="padding:0 0 16px 0;font:400 16px/1.6 ${F.body};color:${C.fg};">${o.body}</td></tr>
${action}
<tr><td style="padding:32px 0 0 0;"><div style="border-top:1px solid ${C.line};padding-top:16px;font:400 13px/1.5 ${F.body};color:${C['fg-muted']};">${o.footer}</div></td></tr>
</table></td></tr></table></body></html>`;
}
