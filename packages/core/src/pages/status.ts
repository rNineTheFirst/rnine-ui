import { bootScript, type BootScriptOptions } from '../hooks/moodBoot';
import { fontFaces, fontFor, paletteId, roleValues, type PageTheme, type PageTokens } from './theme';

/** Escapes text for HTML (element content and attribute values). */
export const escapeHtml = (text: unknown): string =>
  String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export type StatusPageOptions = {
  /** Content, as HTML (escape anything you didn't write: escapeHtml). */
  title: string;
  /** The panel's label ("Maintenance") */
  label: string;
  /** Small text next to the label ("HTTP 503") */
  code?: string;
  heading: string;
  paragraphs: string[];
  /**
   * The status line, written like a command and its answer: "> status
   * example.com" / "updating". tone ok (default): a live signal dot, it's
   * being handled; error: something's wrong with the request itself.
   */
  status: { command?: string; text: string; tone?: 'ok' | 'error' };
  /** Small text at the bottom */
  note?: string;

  /** Plain text from here on (escaped for you), except mark and the extra head/script. */
  /** The site's name (read by screen readers, shown in the header) and its mark, as inline SVG drawn in currentColor. */
  brand?: { name: string; mark?: string };
  /** The status line's prompt. Default ">". */
  prompt?: string;
  /** The favicon's address (a data: URL works: markIcon). */
  icon?: string;
  /** Where the page fonts are served (pageFonts), ending in "/". None: the fonts' fallbacks. */
  fontsUrl?: string;
  /** Where the visitor's mood and motion choices are kept (as in ThemeProvider's mood). */
  mood?: Pick<BootScriptOptions, 'storageKey' | 'motionStorageKey' | 'auto'>;
  /** A palette of the library's (data-palette); the default if it has none by that id. */
  palette?: string | null;
  /** The page's language. Default "en". */
  lang?: string;
  /** Seconds: check the address this often and reload once it answers below 500 (it's back). For pages that answer 5xx. */
  retry?: number;
  /** Extra tags for <head> and inline JS for the end of <body>, as given. */
  head?: string;
  script?: string;
};

/** <meta name="theme-color"> for both moods (the page background). */
export function themeColorMeta(tokens: PageTokens, { palette }: { palette?: string | null } = {}): string {
  return (['light', 'dark'] as const)
    .map((scheme) => `<meta name="theme-color" content="${roleValues(tokens, { scheme, palette }).bg}" media="(prefers-color-scheme: ${scheme})">`)
    .join('\n');
}

// The header clock (as LiveClock: "SYS 17:04:33")
const CLOCK = `(function(){var c=document.getElementById('clock');if(!c)return;function t(){var d=new Date();c.textContent='SYS '+[d.getHours(),d.getMinutes(),d.getSeconds()].map(function(n){return('0'+n).slice(-2)}).join(':')}t();setInterval(t,1000)})();`;

const reloadWhenBack = (seconds: number) =>
  `setInterval(function(){fetch(location.href,{method:'HEAD',cache:'no-store',redirect:'manual'}).then(function(r){if(r.status<500)location.reload()}).catch(function(){})},${Math.round(seconds * 1000)});`;

/**
 * A complete, self-contained status page (maintenance, coming soon, an
 * error): one HTML document with its styles and scripts inline, in the
 * library's look and both its moods. Nothing loads from elsewhere except the
 * page fonts (fontsUrl), so it works while the rest of the site is down.
 */
export function renderStatusPage(theme: PageTheme, o: StatusPageOptions): string {
  const { tokens } = theme;
  const palette = paletteId(tokens, o.palette);
  const prompt = escapeHtml(o.prompt ?? '>');
  const fonts = o.fontsUrl ? fontFaces(tokens, escapeHtml(o.fontsUrl)) : '';
  const titleFont = o.fontsUrl ? fontFor(tokens, 'h1') : undefined;
  const brand = o.brand
    ? `<span class="brand" aria-label="${escapeHtml(o.brand.name)}">${o.brand.mark ?? ''}<span aria-hidden="true">${escapeHtml(o.brand.name)}</span></span>`
    : '<span></span>';
  const command = o.status.command ? ` <span class="cmd">${o.status.command}</span>` : '';
  return `<!doctype html>
<html lang="${escapeHtml(o.lang ?? 'en')}"${palette ? ` data-palette="${palette}"` : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
${themeColorMeta(tokens, { palette })}
<script>${bootScript({ auto: tokens.auto, names: tokens.moods, ...o.mood })}</script>
<title>${o.title}</title>
${o.head ?? ''}${o.icon ? `<link rel="icon" type="image/svg+xml" href="${escapeHtml(o.icon)}">\n` : ''}${titleFont ? `<link rel="preload" href="${escapeHtml(o.fontsUrl)}${titleFont.id}.woff2" as="font" type="font/woff2" crossorigin>\n` : ''}<style>${fonts}${theme.css}</style>
</head>
<body>
<header class="hud">
  ${brand}
  <span class="sys"><span class="pulse" aria-hidden="true"></span><span id="clock">SYS --:--:--</span></span>
</header>
<main>
  <section class="panel" aria-labelledby="title">
    <div class="head"><span class="chip">${o.label}</span>${o.code ? `<span class="code">${o.code}</span>` : ''}</div>
    <h1 id="title" data-reveal>${o.heading}</h1>
${o.paragraphs.map((p) => `    <p>${p}</p>`).join('\n')}
    <div class="term" role="status"><b>${prompt}</b>${command}
<span class="${o.status.tone === 'error' ? 'err' : 'ok'}">${o.status.text}</span> <span class="caret" aria-hidden="true"></span></div>
${o.note ? `    <p class="note">${o.note}</p>\n` : ''}  </section>
</main>
<script>${CLOCK}${theme.reveal ?? ''}${o.retry ? reloadWhenBack(o.retry) : ''}${o.script ?? ''}</script>
</body>
</html>
`;
}
