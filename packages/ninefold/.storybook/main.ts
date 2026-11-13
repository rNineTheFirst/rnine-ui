import type { StorybookConfig } from '@storybook/react-vite';

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
    <link rel="icon" type="image/svg+xml" href="./icons/favicon.svg" />`,
};

export default config;
