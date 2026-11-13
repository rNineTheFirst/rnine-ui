import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { MarkProvider } from '../src';
import type { SiteInfo } from '../site/types';
// What styles.css bundles, from source where it can be (so edits reload)
import '../fonts.css';
import '../dist/tokens.css';
import '../dist/base.css';
import './preview.css';

declare const __SITE__: SiteInfo;
// The host's mark (site/themes.mjs), else Mark's placeholder
const mark = __SITE__.mark;

const preview: Preview = {
  decorators: [
    (Story) => (mark ? <MarkProvider mark={mark}><Story /></MarkProvider> : <Story />),
    // Toolbar toggle between Plain's two moods
    withThemeByDataAttribute({
      themes: { Light: 'light', Dark: 'dark' },
      defaultTheme: 'Light',
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
      storySort: { order: ['Introduction', 'Foundations', 'Components', 'Motion'] },
    },
  },
};

export default preview;
