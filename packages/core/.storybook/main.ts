import type { StorybookConfig } from '@storybook/react-vite';
import { loadSite } from '../site/themes.mjs';

// The themes next to core and the host's settings (site/themes.mjs)
const site = loadSite();

// An old link to a story of the theme that used to be at the root
// (?path=/story/<id>) goes on to /<theme>/ when core has no such story
const forward = site.formerRoot
  ? `<script>(function () {
      var path = new URLSearchParams(location.search).get('path');
      var id = path && path.split('/')[2];
      if (!id) return;
      var get = function (url) { return fetch(url).then(function (r) { return r.ok ? r.json() : { entries: {} }; }); };
      Promise.all([get('./index.json'), get('./${site.formerRoot}/index.json')]).then(function (found) {
        if (!found[0].entries[id] && found[1].entries[id]) location.replace('./${site.formerRoot}/' + location.search + location.hash);
      }).catch(function () {});
    })();</script>`
  : '';

const config: StorybookConfig = {
  // Core's own components in the Plain look, and the introduction (the themes)
  stories: ['../site/docs/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: {
    disableTelemetry: true,
    // Its own Vite config: the package's vite.config.ts is a library build
    builder: { name: '@storybook/builder-vite', options: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
  docs: { defaultName: 'Docs' },
  // Favicons, served at /core/ (the theme Storybooks sit at /<id>/)
  staticDirs: [{ from: site.icons, to: '/core' }],
  managerHead: (head) => `${head}
    <link rel="icon" type="image/svg+xml" href="./core/favicon.svg" />${site.appleTouchIcon ? `
    <link rel="apple-touch-icon" href="./core/apple-touch-icon.png" />` : ''}${site.brandUrl ? `
    <script>window.STORYBOOK_BRAND_URL = ${JSON.stringify(site.brandUrl)};</script>` : ''}${forward}`,
  viteFinal: (vite) => ({
    ...vite,
    define: { ...vite.define, __SITE__: JSON.stringify(site) },
  }),
};

export default config;
