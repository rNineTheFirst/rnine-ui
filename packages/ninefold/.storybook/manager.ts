import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
import { tokens } from '../dist/tokens.js';

// Storybook's own interface in Ninefold's colors (Gloam, by candlelight), from its tokens
const gloam = Object.fromEntries(tokens.schemes.dark.map((r) => [r.name, r.value])) as Record<string, string>;
const font = Object.fromEntries(tokens.groups.font.map((t) => [t.name, t.value])) as Record<string, string>;

addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Ninefold · @rnine/ninefold',
    colorPrimary: gloam.accent,
    colorSecondary: gloam.accent,
    appBg: gloam.bg,
    appContentBg: gloam.bg,
    appPreviewBg: gloam.bg,
    appBorderColor: gloam.line,
    appBorderRadius: 12,
    textColor: gloam.fg,
    textMutedColor: gloam['fg-muted'],
    barBg: gloam.surface,
    barTextColor: gloam['fg-muted'],
    barSelectedColor: gloam.accent,
    inputBg: gloam.surface,
    inputBorder: gloam.line,
    inputBorderRadius: 6,
    fontBase: font['font-body'],
    fontCode: font['font-mono'],
  }),
});
