import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
import { tokens } from '../dist/tokens.js';

// Set by main.ts when the host has a brand kit for NineSync (core/site/themes.mjs)
const brandUrl = (window as { STORYBOOK_BRAND_URL?: string }).STORYBOOK_BRAND_URL;

// Storybook's own interface in NineSync's Light mood (the default client colors), from its tokens
const light = Object.fromEntries(tokens.schemes.light.map((r) => [r.name, r.value])) as Record<string, string>;
const font = Object.fromEntries(tokens.groups.font.map((t) => [t.name, t.value])) as Record<string, string>;

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'NineSync · @rnine/ninesync',
    brandUrl,
    colorPrimary: light.accent,
    colorSecondary: light['accent-text'],
    appBg: light.bg,
    appContentBg: light.surface,
    appPreviewBg: light.bg,
    appBorderColor: light.line,
    appBorderRadius: 12,
    textColor: light.fg,
    textMutedColor: light['fg-muted'],
    barBg: light.surface,
    barTextColor: light['fg-muted'],
    barSelectedColor: light['accent-text'],
    inputBg: light.surface,
    inputBorder: light['line-strong'],
    inputBorderRadius: 8,
    fontBase: font['font-body'],
    fontCode: font['font-mono'],
  }),
});
