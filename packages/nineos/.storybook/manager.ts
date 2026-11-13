import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
import { tokens } from '../dist/tokens.js';

// Set by main.ts when a hosted copy has its own link (identity.ts)
const brandUrl = (window as { STORYBOOK_BRAND_URL?: string }).STORYBOOK_BRAND_URL;

// Storybook's own interface in NineOS's colors (Cipher), from its tokens
const cipher = Object.fromEntries(tokens.schemes.dark.map((r) => [r.name, r.value])) as Record<string, string>;
const font = Object.fromEntries(tokens.groups.font.map((t) => [t.name, t.value])) as Record<string, string>;

addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'N I N E O S · @rnine/nineos',
    brandUrl,
    colorPrimary: cipher.accent,
    colorSecondary: cipher.accent,
    appBg: cipher.bg,
    appContentBg: cipher.bg,
    appPreviewBg: cipher.bg,
    appBorderColor: cipher.line,
    appBorderRadius: 0,
    textColor: cipher.fg,
    textMutedColor: cipher['fg-muted'],
    barBg: cipher.surface,
    barTextColor: cipher['fg-muted'],
    barSelectedColor: cipher.accent,
    inputBg: cipher.surface,
    inputBorder: cipher.line,
    inputBorderRadius: 0,
    fontBase: font['font-body'],
    fontCode: font['font-mono'],
  }),
});
