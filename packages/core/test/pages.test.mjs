// @rnine/core/pages, built (dist/pages.js): Plain's static pages.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as pages from '../dist/pages.js';
import { moodBootScript as hookBootScript } from '../dist/hooks/mood.js';
import { tokens } from '../dist/tokens.js';

const { PAGE_CSS, createPages, emailLayout, emailTheme, escapeHtml, markIcon, moodBootScript, statusPage, themeColorMeta } = pages;

const page = (extra = {}) =>
  statusPage({ title: 'T', label: 'Maintenance', heading: 'Back soon', paragraphs: ['One', 'Two'], status: { command: 'status x', text: 'updating' }, ...extra });

test('the page styles carry no values of their own: every color is a token', () => {
  assert.ok(PAGE_CSS.length > 1000);
  // transparent (minified to #0000, the scrollbar track) isn't a value of its own
  assert.deepEqual(PAGE_CSS.match(/#(?!0000\b)[0-9a-f]{3,8}\b|rgba?\(/gi), null);
  assert.match(PAGE_CSS, /var\(--r9-shape-cut\)/);
  assert.match(PAGE_CSS, /@keyframes r9-pulse/);
});

test('a status page is one self-contained document in the library look', () => {
  const html = page({ code: 'HTTP 503', note: 'N', retry: 30 });
  assert.match(html, /^<!doctype html>\n<html lang="en">/);
  assert.match(html, /<h1 id="title" data-reveal>Back soon<\/h1>/);
  assert.match(html, /<p>One<\/p>\n {4}<p>Two<\/p>/);
  assert.match(html, /<span class="code">HTTP 503<\/span>/);
  assert.match(html, /<b>&gt;<\/b> <span class="cmd">status x<\/span>/);
  assert.match(html, /<span class="ok">updating<\/span>/);
  assert.match(html, /location\.reload\(\)\}\)\.catch\(function\(\)\{\}\)\},30000\)/);
  assert.ok(html.includes(themeColorMeta()));
  assert.ok(html.includes(`<script>${moodBootScript()}</script>`));
  assert.ok(html.includes(PAGE_CSS));
  // Plain serves no fonts and has no title effect
  assert.doesNotMatch(html, /@font-face|rel="preload"/);
  assert.doesNotMatch(html, /src=|href="http/);
});

test('plain-text options are escaped; the error tone and a missing command', () => {
  const html = page({ brand: { name: 'A&B <x>' }, prompt: '<p>', lang: 'en"', status: { text: 'bad', tone: 'error' } });
  assert.match(html, /aria-label="A&amp;B &lt;x&gt;"/);
  assert.match(html, /<b>&lt;p&gt;<\/b>\n<span class="err">bad<\/span>/);
  assert.match(html, /<html lang="en&quot;">/);
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
});

test('Plain has no palettes: data-palette is never set', () => {
  assert.doesNotMatch(page({ palette: 'volt' }), /data-palette/);
});

test("the boot script is the hooks' one, with the library's Auto rule and names", () => {
  assert.equal(moodBootScript(), hookBootScript());
  assert.equal(moodBootScript({ storageKey: 'k', motionStorageKey: 'm' }), hookBootScript({ storageKey: 'k', motionStorageKey: 'm' }));
  assert.match(moodBootScript(), /d\?'dark':'light'/);
  assert.throws(() => moodBootScript({ storageKey: 'a;b' }), /Storage key/);
});

test('emails: resolved light colors, quoted font stacks, the library radius', () => {
  const t = emailTheme();
  const light = Object.fromEntries(tokens.schemes.light.map((r) => [r.name, r.value]));
  assert.equal(t.colors.accent, light.accent);
  assert.equal(t.colors.bg, light.bg);
  for (const stack of Object.values(t.fonts)) assert.doesNotMatch(stack, /"/);
  assert.equal(t.radius, '3.6px'); // corner-sm 6px x shape-round 0.6
  assert.equal(t.ornamentRadius, '60%');
  assert.equal(t.fontFaces('https://x/'), '');

  const html = emailLayout({ eyebrow: 'e<', title: 'T&', preheader: 'p', body: '<p>b</p>', action: { label: 'Go', href: 'https://x/?a=1&b=2' }, footer: 'f' });
  assert.match(html, /<title>T&amp;<\/title>/);
  assert.match(html, /e&lt;<\/td>/);
  assert.match(html, /href="https:\/\/x\/\?a=1&amp;b=2"/);
  assert.ok(html.includes(`background:${light.accent};color:${light['on-accent']}`));
  assert.ok(html.includes('<p>b</p>'));
});

test('icons: an accent plate in the library shape (Plain rounds every corner)', () => {
  const svg = markIcon({ mark: { viewBox: '0 0 10 10', paths: '<path fill="#000" d="M0 0h10v10z"/>' } });
  const light = Object.fromEntries(tokens.schemes.light.map((r) => [r.name, r.value]));
  assert.equal(
    svg,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M7.2 0H56.8A7.2 7.2 0 0 1 64 7.2V56.8A7.2 7.2 0 0 1 56.8 64H7.2A7.2 7.2 0 0 1 0 56.8V7.2A7.2 7.2 0 0 1 7.2 0Z" fill="${light.accent}"/>` +
      `<svg x="16" y="16" width="32" height="32" viewBox="0 0 10 10"><path fill="${light['on-accent']}" d="M0 0h10v10z"/></svg></svg>`,
  );
});

test('createPages binds a library: cut corners, its palettes, its fonts and title effect', () => {
  const lib = structuredClone(tokens);
  lib.groups.shape = lib.groups.shape.map((t) => ({ ...t, value: t.name === 'shape-cut' ? 1 : 0 }));
  lib.palettes = [
    { id: 'a', label: 'A', default: true, schemes: lib.schemes },
    { id: 'b', label: 'B', schemes: { light: lib.schemes.light.map((r) => (r.name === 'accent' ? { ...r, value: '#123456' } : r)), dark: lib.schemes.dark } },
  ];
  lib.fonts = [{ id: 'disp-700', family: lib.typeRoles.find((r) => r.name === 'h1').fontFamily.split(',')[0].replace(/"/g, ''), weight: '100 900', style: 'normal', src: 'x.woff2' }];
  const p = createPages({ tokens: lib, css: '/*lib*/', reveal: '/*reveal*/' });

  const svg = p.markIcon({ mark: { viewBox: '0 0 1 1', paths: '' } });
  assert.match(svg, /<path d="M12 0H64V52L52 64H0V12Z"/);
  assert.match(p.markIcon({ mark: { viewBox: '0 0 1 1', paths: '' }, palette: 'b' }), /fill="#123456"/);
  assert.equal(p.emailTheme({ palette: 'b' }).colors.accent, '#123456');
  assert.equal(p.emailTheme().radius, '0');

  const html = p.statusPage({ title: 'T', label: 'L', heading: 'H', paragraphs: [], status: { text: 's' }, palette: 'b', fontsUrl: '/f/' });
  assert.match(html, /<html lang="en" data-palette="b">/);
  assert.doesNotMatch(p.statusPage({ title: 'T', label: 'L', heading: 'H', paragraphs: [], status: { text: 's' }, palette: 'a' }), /data-palette/);
  assert.match(html, /@font-face\{font-family:"[^"]+";src:url\("\/f\/disp-700\.woff2"\)/);
  assert.match(html, /<link rel="preload" href="\/f\/disp-700\.woff2" as="font"/);
  assert.match(html, /\/\*lib\*\/<\/style>/);
  assert.match(html, /\/\*reveal\*\//);
  assert.deepEqual(p.pageFonts, lib.fonts);
});
