import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { MarkProvider } from '@rnine/core';
import { ThemeConfigProvider } from '@rnine/core/kit';
import { NINEFOLD_THEME } from '../src/provider/ThemeProvider';
import { PageEffects } from '../src/motion/PageEffects';
import { BOOK_MARK } from '../src/example/book';
// What styles.css bundles, from source where it can be (so edits reload)
import '../fonts.css';
import '../dist/tokens.css';
import '@rnine/core/base.css';
import '../dist/ninefold-base.css';
import './preview.css';

const preview: Preview = {
  decorators: [
    // Core components draw with Ninefold's effects and mood names; every Mark is the sample shop's book
    (Story) => (
      <ThemeConfigProvider config={NINEFOLD_THEME}>
        <MarkProvider mark={BOOK_MARK}>
          <Story />
          <PageEffects />
        </MarkProvider>
      </ThemeConfigProvider>
    ),
    // Toolbar toggle between the two Ninefold moods
    withThemeByDataAttribute({
      themes: { Glint: 'light', Gloam: 'dark' },
      defaultTheme: 'Glint',
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
      storySort: { order: ['Introduction', 'Brand', 'Example', 'Components', 'Motion'] },
    },
  },
};

export default preview;
