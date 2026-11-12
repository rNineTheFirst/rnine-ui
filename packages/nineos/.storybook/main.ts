import type { StorybookConfig } from '@storybook/react-vite';
import { identity } from './identity';

const config: StorybookConfig = {
  // NineOS's own stories, and core's (its components, here in the NineOS look)
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)', '../../core/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: {
    disableTelemetry: true,
    // Its own Vite config: the package's vite.config.ts is a library build
    builder: { name: '@storybook/builder-vite', options: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
  docs: { defaultName: 'Docs' },
  // Favicons, served at /nineos/ (see identity.ts)
  staticDirs: [{ from: identity.icons, to: '/nineos' }],
  managerHead: (head) => `${head}
    <link rel="icon" type="image/svg+xml" href="./nineos/favicon.svg" />${identity.appleTouchIcon ? `
    <link rel="apple-touch-icon" href="./nineos/apple-touch-icon.png" />` : ''}${identity.brandUrl ? `
    <script>window.STORYBOOK_BRAND_URL = ${JSON.stringify(identity.brandUrl)};</script>` : ''}`,
  // The mark every Mark in the stories draws (preview.tsx)
  viteFinal: (vite) => ({
    ...vite,
    define: { ...vite.define, __STORYBOOK_MARK__: JSON.stringify(identity.mark ?? null) },
  }),
};

export default config;
