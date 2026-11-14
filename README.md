# Design system libraries

**Docs and every component, live: [ui.rnine.dev](https://ui.rnine.dev)** (Storybook: the core components in Plain, and every theme one click away)

Open-source design system libraries for React, MIT licensed. Each library is a complete
component library with its own look; they all export the same components, effects and
SCSS API with the same props, so an app switches from one to another by changing the import.

| Package | What |
| --- | --- |
| [`@rnine/core`](packages/core) | The shared core: the mood and motion engine, every component the libraries share (in Plain, a neutral placeholder look), the SCSS API (`corner`, `ornament`, `texture`, ...), the token build tool and the conformance checks. Usable on its own |
| [`@rnine/nineos`](packages/nineos) | NineOS: two moods, Clear (light) and Cipher (dark), cut corners, magenta, and its own pieces: a command-line-plus-panels shell and the NineOS effects (decrypting text, a reactive dot field, the signal swap). Storybook included |
| [`@rnine/ninefold`](packages/ninefold) | Ninefold: cozy fantasy. Two moods, Glint (day: honey paper, iron-gall ink, claret wax) and Gloam (night: a walnut desk by candlelight), folded card corners, a wax-seal mark, falling leaves by day and fireflies by night, and its own pieces: a lantern trail, a field journal, a moon dial, hero light and a page you can write on |
| [`@rnine/ninesync`](packages/ninesync) | NineSync: calm internal tools and dashboards in the client's own color. DM Sans, Light and Dark moods with greys tinted toward the brand hue, a pale mark under titles, tabs and the current page that glides between them, a soft glow on hover, numbers that count up, and a checker that turns a client's brand color into accessible accent roles (asking for a second color where it fails) |

They ship without a logo or favicons: an app gives `ThemeProvider` its own mark, and
`Mark` shows a placeholder frame until it does.

## Quick start

```bash
yarn add @rnine/nineos react react-dom
```

```tsx
import '@rnine/nineos/fonts.css';
import '@rnine/nineos/styles.css';
import { Button, ThemeProvider } from '@rnine/nineos';

createRoot(root).render(
  <ThemeProvider>
    <Button>Hello</Button>
  </ThemeProvider>,
);
```

See each package's README for the options (your mark, sharing the chosen mood across
subdomains, the first-paint boot script), the component list and how to build a library
of your own on core.

## What every library has

- The same exports as `@rnine/core` (and `@rnine/core/motion` and `@rnine/core/pages`), with the same props. Effects
  are named by role (`TextReveal`, `Backdrop`, `Mark`, `PageEffects`, `swapIn`/`swapOut`)
  and each library brings its own.
- Two moods, one per color scheme: the page carries `data-scheme="light" | "dark"`, and each
  library names its moods (NineOS: Clear and Cipher; Plain: Light and Dark).
- One prefix for CSS custom properties, `--r9-*`, and the same token names, so core
  components take on any library's look.
- `styles.css`, `fonts.css`, `scss` and `tokens` entry points.
- Static pages from the same tokens, for where React doesn't run (`pages`): status and error
  pages, emails, app icons and the mood boot script, in Workers and Node.

## Develop

Node 26 and Yarn 1.

```bash
yarn install
yarn build        # core, then NineOS
yarn test
yarn lint
yarn storybook    # http://localhost:6006
yarn boundary     # checks this folder stands alone (see scripts/boundary.mjs)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for how changes land here.

## Licenses

The code is MIT (see [LICENSE](LICENSE)). NineOS's fonts come from Fontsource packages under
the SIL Open Font License (Chakra Petch, Hanken Grotesk, Share Tech Mono); icons from
lucide-react (ISC) and simple-icons (CC0). Brand logos drawn by `ContactIcon` belong to their
owners.
