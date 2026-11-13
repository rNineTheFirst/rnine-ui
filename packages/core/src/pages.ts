// @rnine/core/pages: static pages from a library's tokens, for where React
// doesn't run: status and error pages (served by a Worker or nginx), emails,
// favicons and app icons, the mood boot script and theme-color metas. No
// React, no DOM: runs in Workers and Node.
//
// Every library exports the same names from "<library>/pages", in its look
// (core's are Plain's):
//
//   import { statusPage } from '@rnine/nineos/pages';
//   const html = statusPage({ title: 'Back soon', label: 'Maintenance', heading: 'Back soon',
//     paragraphs: ['We’re updating the site.'], status: { command: 'status', text: 'updating' } });
//
// A library makes its own with createPages({ tokens, css, reveal }): css is
// its tokens.css followed by PAGE_CSS (and anything of its own).
import { css as tokensCss, tokens } from '@rnine/core/tokens';
import { createPages } from './pages/create';
import pageCss from './pages/page.scss?inline';

/** Core's page styles (base styles, then the status page's), all token custom properties: put a library's tokens.css first. */
export const PAGE_CSS: string = pageCss;
export { createPages };
export type { Pages } from './pages/create';
export { escapeHtml } from './pages/status';
export type { StatusPageOptions } from './pages/status';
export type { EmailLayoutOptions, EmailTheme } from './pages/email';
export type { MarkIconOptions } from './pages/icon';
export type { PageFont, PageTheme, PageTokens, TokenEntry } from './pages/theme';
export type { AutoRule, BootScriptOptions, MoodName, MoodNames, Scheme } from './hooks/moodBoot';

const plain = createPages({ tokens, css: tokensCss + PAGE_CSS });

export const { statusPage, emailLayout, emailTheme, markIcon, moodBootScript, themeColorMeta, pageFonts } = plain;
