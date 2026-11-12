// A hosted Storybook can show its owner's mark, favicons and link instead of
// the placeholders. If the package named by STORYBOOK_IDENTITY (default
// "@rnine/identity") is installed and its package.json has a "storybook" field,
// it's used:
//
//   "storybook": {
//     "mark": "assets/mark.svg",                  Mark artwork (SVG, filled paths)  
//     "simplifiedMark": "assets/mark-small.svg",  optional, for 24px and below
//     "icons": "assets",                          folder with favicon.svg (and apple-touch-icon.png)
//     "brandUrl": "https://example.com"           where the sidebar title links
//   }
//
// Without one, Storybook shows the placeholder mark and favicon (static/).
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type Identity = {
  mark?: { full: string; simplified?: string };
  icons: string;
  appleTouchIcon: boolean;
  brandUrl?: string;
};

const here = dirname(fileURLToPath(import.meta.url));

function load(): Identity {
  const fallback: Identity = { icons: join(here, 'static'), appleTouchIcon: false };
  const name = process.env.STORYBOOK_IDENTITY ?? '@rnine/identity';
  let manifest: string;
  try {
    manifest = createRequire(import.meta.url).resolve(`${name}/package.json`);
  } catch {
    return fallback;
  }
  const root = dirname(manifest);
  const config = JSON.parse(readFileSync(manifest, 'utf8')).storybook;
  if (!config) return fallback;
  const read = (file?: string) => (file ? readFileSync(join(root, file), 'utf8') : undefined);
  const icons = config.icons ? join(root, config.icons) : fallback.icons;
  return {
    mark: config.mark ? { full: read(config.mark)!, simplified: read(config.simplifiedMark) } : undefined,
    icons,
    appleTouchIcon: existsSync(join(icons, 'apple-touch-icon.png')),
    brandUrl: config.brandUrl,
  };
}

export const identity = load();
