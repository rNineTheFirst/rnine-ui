import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
import { tokens } from '../dist/tokens.js';

// Set by main.ts when the host has a brand kit link (site/themes.mjs)
const brandUrl = (window as { STORYBOOK_BRAND_URL?: string }).STORYBOOK_BRAND_URL;

// Storybook's own interface in Plain's light mood, from core's tokens
const light = Object.fromEntries(tokens.schemes.light.map((r) => [r.name, r.value])) as Record<string, string>;
const font = Object.fromEntries(tokens.groups.font.map((t) => [t.name, t.value])) as Record<string, string>;

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Core · @rnine/core',
    brandUrl,
    colorPrimary: light.accent,
    colorSecondary: light.accent,
    appBg: light.surface,
    appContentBg: light.bg,
    appPreviewBg: light.bg,
    appBorderColor: light.line,
    textColor: light.fg,
    textMutedColor: light['fg-muted'],
    barBg: light.bg,
    barTextColor: light['fg-muted'],
    barSelectedColor: light.accent,
    inputBg: light.bg,
    inputBorder: light.line,
    fontBase: font['font-body'],
    fontCode: font['font-mono'],
  }),
});
