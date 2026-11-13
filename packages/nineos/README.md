# @rnine/nineos

**Docs and every component, live: [ui.rnine.dev/nineos](https://ui.rnine.dev/nineos/)** (Storybook)

NineOS: a design system library for React, built on [`@rnine/core`](../core). Two moods,
**Clear** (light) and **Cipher** (dark); cut corners; magenta for the one thing that
matters; a command line that answers with panels; and the NineOS motion layer.

It exports everything `@rnine/core` does, with the same props, in the NineOS look, plus
its own pieces:

- **The shell**: `CommandLine`, `ChipBar`, `PanelStage` (with the signal swap), `Dock`,
  `Hud`, `Kbd`, `Hint`.
- **Its effects in the shared roles**: `TextReveal` decodes from magenta terminal symbols,
  `Backdrop` is the reactive dot field, `Mark` glitches in cyan and magenta,
  `swapIn`/`swapOut` are the signal swap, `PageEffects` are Cipher's scanlines and the
  magenta click sparks.
- **NineOS only** in `/motion`: `Terminal`, `VelocityStrip`. In SCSS: `glitch-text()`.

```bash
yarn workspace @rnine/nineos storybook          # Storybook on http://localhost:6006 (NineOS and core stories)
yarn workspace @rnine/nineos test               # component and conformance tests
yarn workspace @rnine/nineos build-storybook    # static Storybook in storybook-static/
```

Changing token JSON needs `yarn workspace @rnine/nineos build` before Storybook picks it up;
component and mixin edits reload instantly.

## Use it in an app

```bash
npm install @rnine/nineos react react-dom    # sass too, to use the SCSS API
```

```tsx
// entry file, once
import '@rnine/nineos/fonts.css';    // Chakra Petch, Hanken Grotesk, Share Tech Mono (self-hosted)
import '@rnine/nineos/styles.css';   // tokens, Clear/Cipher switching, base styles, keyframes, every component
import { ThemeProvider } from '@rnine/nineos';
import markSvg from './mark.svg?raw';

createRoot(root).render(
  <ThemeProvider mark={{ full: markSvg }} mood={{ cookieDomain: 'example.com' }}>
    <App />
  </ThemeProvider>,
);
```

Auto shows Clear by day (06:00-18:00, the viewer's time) and, at night, Cipher only for a
dark system setting, until the viewer chooses. Put `moodBootScript()`'s output in an
inline `<script>` in your `index.html` `<head>` for the right mood on the first paint.

```tsx
import { Button, CommandLine, Panel, PanelStage } from '@rnine/nineos';
import { Backdrop, TextReveal, Terminal } from '@rnine/nineos/motion';
import { tokens } from '@rnine/nineos/tokens';   // tokens as data (docs, charts, canvas effects)
```

Status and error pages, emails and app icons in the NineOS look, for where React doesn't
run (a Worker, nginx, a mail server), come from `@rnine/nineos/pages`: `statusPage()` is
one HTML document with everything inline but the fonts, which you serve from `pageFonts`
at `fontsUrl`.

```js
import { statusPage } from '@rnine/nineos/pages';

const html = statusPage({
  title: 'Back soon', label: 'Maintenance', code: 'HTTP 503', heading: 'Back soon',
  paragraphs: ['We’re updating the site.'], status: { command: 'status', text: 'updating' },
  fontsUrl: '/fonts/', retry: 30,
});
```

```scss
// in any SCSS module
@use "@rnine/nineos/scss" as r9;

.button {
  @include r9.type(label);
  @include r9.corner(md);        // NineOS: a cut top-left and bottom-right corner
  background: r9.$accent;
  &::after { @include r9.ornament; }
}
```

## Moods

The page carries `data-scheme="light"` (Clear) or `data-scheme="dark"` (Cipher), and any
element can too. With no attribute (no JavaScript), Cipher follows a dark system setting.
A mood saved by an older version (`clear`, `cipher`) is read as its scheme.

## Files

| Path | What |
|---|---|
| `theme.json` | The name, the moods' names (Clear, Cipher), the Auto rule (night), the default palette and the fonts static pages serve |
| `tokens/*.json` | Primitives and scales (DTCG format): color, type, space, corner and shape, motion, layout |
| `tokens/themes/{light,dark}.json` | Clear's and Cipher's mood roles (bg, fg, accent, signal, ...). Both must define the same roles |
| `scss/` | The shared SCSS API (from core) plus `glitch-text()`; `base.scss` adds NineOS's keyframes |
| `src/` | NineOS's components and effects; `index.ts`, `motion.ts` and `pages.ts` re-export core and replace the role exports |
| `scripts/build.mjs` | Tokens (checked against core's), `vite build`, then `dist/styles.css` |
| `test/contrast.test.mjs` | WCAG AA in both moods, and the contract: core's tokens and exports, the keyframes, theme.json |

No logo or favicons: an app brings its own mark (`ThemeProvider mark`).

## Rules

- Components use mood roles (`r9.$accent`), never primitives or hex values.
- Every component has at least one magenta element (`r9.$accent`). If none is natural, add `@include r9.ornament`.
- Cyan (`r9.$signal`) is only for live signals: status, data, the cursor's light.
- Space siblings with `gap`, not margins. Motion goes inside `@include r9.motion-safe`.
