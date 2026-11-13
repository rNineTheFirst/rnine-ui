import { bootScript, type BootScriptOptions } from '../hooks/moodBoot';
import { emailTheme, renderEmailLayout, type EmailLayoutOptions, type EmailTheme } from './email';
import { renderMarkIcon, type MarkIconOptions } from './icon';
import { renderStatusPage, themeColorMeta, type StatusPageOptions } from './status';
import type { PageFont, PageTheme } from './theme';

export type Pages = {
  /** A complete, self-contained status page (maintenance, coming soon, an error). */
  statusPage(options: StatusPageOptions): string;
  /** The frame every email shares, in the library's look. */
  emailLayout(options: EmailLayoutOptions): string;
  /** The library's look as resolved values, for the parts of an email you write yourself. */
  emailTheme(options?: { palette?: string | null }): EmailTheme;
  /** The site's mark on an accent plate in the library's corner shape: a favicon or app icon (SVG). */
  markIcon(options: MarkIconOptions): string;
  /** The inline script that sets the mood before first paint, with the library's Auto rule. */
  moodBootScript(options?: BootScriptOptions): string;
  /** <meta name="theme-color"> for both moods. */
  themeColorMeta(options?: { palette?: string | null }): string;
  /** The font files the pages and emails use: serve each at <fontsUrl><id>.woff2. */
  pageFonts: readonly PageFont[];
};

/**
 * A library's static pages: status pages, emails, icons. Each library's
 * "<library>/pages" export is createPages with its tokens (core's own is
 * Plain), so the same calls take the look of whichever library is imported.
 */
export function createPages(theme: PageTheme): Pages {
  const { tokens } = theme;
  return {
    statusPage: (options) => renderStatusPage(theme, options),
    emailLayout: (options) => renderEmailLayout(tokens, options),
    emailTheme: (options) => emailTheme(tokens, options),
    markIcon: (options) => renderMarkIcon(tokens, options),
    moodBootScript: (options = {}) => bootScript({ ...options, auto: options.auto ?? tokens.auto, names: options.names ?? tokens.moods }),
    themeColorMeta: (options) => themeColorMeta(tokens, options),
    pageFonts: tokens.fonts ?? [],
  };
}
