import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Set by main.ts when a hosted copy has its own link (identity.ts)
const brandUrl = (window as { STORYBOOK_BRAND_URL?: string }).STORYBOOK_BRAND_URL;

// Storybook's own interface in NineOS colors (Cipher)
addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'N I N E O S · @rnine/nineos',
    brandUrl,
    colorPrimary: '#FF1F9A',
    colorSecondary: '#FF1F9A',
    appBg: '#050506',
    appContentBg: '#0A0A0C',
    appPreviewBg: '#050506',
    appBorderColor: '#26262C',
    appBorderRadius: 0,
    textColor: '#F4F4F6',
    textMutedColor: '#A2A2AD',
    barBg: '#111114',
    barTextColor: '#A2A2AD',
    barSelectedColor: '#FF1F9A',
    inputBg: '#111114',
    inputBorder: '#26262C',
    inputBorderRadius: 0,
    fontBase: '"Hanken Grotesk", system-ui, sans-serif',
    fontCode: '"Share Tech Mono", ui-monospace, monospace',
  }),
});
