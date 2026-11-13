import type { StorybookConfig } from '@storybook/react-vite';
import { loadSite } from '../../core/site/themes.mjs';

// Where the host keeps Ninefold's brand kit, if it has one (its brandUrl + ninefold/)
const site = loadSite();
const kit = site.brandUrl ? `${site.brandUrl}ninefold/` : null;

const config: StorybookConfig = {
  // Ninefold's own stories and docs, and core's stories (its components, here in the Ninefold look)
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)', '../../core/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: {
    disableTelemetry: true,
    // Its own Vite config: the package's vite.config.ts is a library build
    builder: { name: '@storybook/builder-vite', options: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
  docs: { defaultName: 'Docs' },
  staticDirs: [{ from: './static', to: '/icons' }],
  managerHead: (head) => `${head}
    <link rel="icon" type="image/svg+xml" href="./icons/favicon.svg" />${kit ? `
    <script>window.STORYBOOK_BRAND_URL = ${JSON.stringify(kit)};</script>` : ''}`,
  // The brand kit's address for the docs pages (Brand/Rules)
  viteFinal: (vite) => ({
    ...vite,
    define: { ...vite.define, __KIT_URL__: JSON.stringify(kit) },
  }),
};

export default config;
