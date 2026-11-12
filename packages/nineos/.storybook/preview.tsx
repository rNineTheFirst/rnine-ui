import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { MarkProvider, type MarkArtwork } from '@rnine/core';
import { ThemeConfigProvider } from '@rnine/core/kit';
import { NINEOS_THEME } from '../src/provider/ThemeProvider';
import { tokens } from '../dist/tokens.js';
// What styles.css bundles, from source where it can be (so edits reload)
import '../fonts.css';
import '../dist/tokens.css';
import '@rnine/core/base.css';
import '../dist/nineos-base.css';
import './preview.css';

// A hosted copy's own mark (main.ts, identity.ts); else Mark's placeholder
declare const __STORYBOOK_MARK__: MarkArtwork | null;
const mark = __STORYBOOK_MARK__;

const DEFAULT_PALETTE = tokens.palettes.find((p) => p.default)?.id ?? 'magenta';

const preview: Preview = {
  // Toolbar: the accent palette (Magenta is the default and needs no attribute)
  globalTypes: {
    palette: {
      description: 'Accent palette',
      toolbar: {
        title: 'Palette',
        icon: 'paintbrush',
        items: tokens.palettes.map((p) => ({ value: p.id, title: p.label })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { palette: DEFAULT_PALETTE },
  decorators: [
    (Story, { globals }) => {
      const palette = (globals.palette as string | undefined) ?? DEFAULT_PALETTE;
      if (palette === DEFAULT_PALETTE) document.documentElement.removeAttribute('data-palette');
      else document.documentElement.setAttribute('data-palette', palette);
      return <Story />;
    },
    // Core components draw with NineOS's effects (TextReveal, ...) and mood names
    (Story) => (
      <ThemeConfigProvider config={NINEOS_THEME}>
        {mark ? <MarkProvider mark={mark}><Story /></MarkProvider> : <Story />}
      </ThemeConfigProvider>
    ),
    // Toolbar toggle between the two NineOS moods
    withThemeByDataAttribute({
      themes: { Clear: 'light', Cipher: 'dark' },
      defaultTheme: 'Clear',
      attributeName: 'data-scheme',
      parentSelector: 'html',
    }),
  ],
  parameters: {
    layout: 'padded',
    controls: { expanded: true, matchers: { color: /(background|color)$/i } },
    backgrounds: { disable: true },
    a11y: { test: 'error' },
    options: {
      storySort: { order: ['Introduction', 'Foundations', 'Components', 'Motion', 'Brand'] },
    },
  },
};

export default preview;
