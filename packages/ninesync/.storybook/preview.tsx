import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { MarkProvider } from '@rnine/core';
import { ThemeConfigProvider } from '@rnine/core/kit';
import { NINESYNC_THEME } from '../src/provider/ThemeProvider';
import { PageEffects } from '../src/motion/PageEffects';
import { ClientTheme } from '../src/client/ClientTheme';
import { SAMPLE_CLIENTS, SAMPLE_MARK } from '../src/example/client';
// What styles.css bundles, from source where it can be (so edits reload)
import '../fonts.css';
import '../dist/tokens.css';
import '@rnine/core/base.css';
import '../dist/ninesync-base.css';
import '../src/look.scss';
import './preview.css';

const preview: Preview = {
  // Toolbar: the client colors every story wears (the default is the built tokens)
  globalTypes: {
    client: {
      description: 'Client color',
      toolbar: {
        title: 'Client',
        icon: 'paintbrush',
        items: SAMPLE_CLIENTS.map((c) => ({ value: c.id, title: c.name, right: c.colors.brand })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { client: SAMPLE_CLIENTS[0].id },
  decorators: [
    // Core components draw with NineSync's effects and mood names; every Mark is the sample client's
    (Story, { globals }) => {
      const client = SAMPLE_CLIENTS.find((c) => c.id === globals.client);
      return (
        <ThemeConfigProvider config={NINESYNC_THEME}>
          <MarkProvider mark={SAMPLE_MARK}>
            {client && client.id !== SAMPLE_CLIENTS[0].id && <ClientTheme colors={client.colors} />}
            <Story />
            <PageEffects />
          </MarkProvider>
        </ThemeConfigProvider>
      );
    },
    // Toolbar toggle between the two NineSync moods
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
      storySort: { order: ['Introduction', 'Brand', 'Example', 'Client colors', 'Components', 'Motion'] },
    },
  },
};

export default preview;
