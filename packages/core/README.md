# @rnine/core

**Docs and every component, live: [ui.rnine.dev](https://ui.rnine.dev)** (Storybook)

The shared core of the design system libraries. Every library (like
[`@rnine/nineos`](../nineos)) is built on it and exports everything it exports, with
the same props, in its own look. On its own, core is a complete library too, in
**Plain**: system fonts, neutral grays, one blue accent, rounded corners.

What's in it:

- **Components** every library shares: buttons, fields, cards, tables, modals, toasts,
  panels, the menu rail, media, layout, the mood and motion toggles, ...
- **Effects by role**: `TextReveal`, `Backdrop`, `Mark`, `PageEffects`, `swapIn`/`swapOut`.
  Core components draw with the library's version (Plain's are still or simple fades).
- **The mood engine**: two moods per library, one per color scheme, kept on
  `<html data-scheme="light|dark">`, saved in the browser and optionally shared across
  subdomains, with a first-paint boot script.
- **The SCSS API**: tokens as variables, `type()`, `up()`/`down()`, `corner()`,
  `card-corner()`, `ornament()`, `corner-ornament()`, `card-ornament()`, `texture()` (dots,
  grid, scanlines, paper fibers and grain), `hairline()`, `glass()`, `focus-ring()`,
  `keyframes()`, ...
- **The token build tool** (`@rnine/core/build-tokens`) and **conformance checks**
  (`@rnine/core/conformance`) for building a library of your own.

## Use it in an app

```bash
npm install @rnine/core react react-dom    # or a library built on it, e.g. @rnine/nineos
                                           # sass too, to use the SCSS API
```

```tsx
// entry file, once
import '@rnine/core/fonts.css';    // Plain uses system fonts: nothing to load (other libraries load theirs)
import '@rnine/core/styles.css';   // tokens, base styles, shared keyframes, every component
import { ThemeProvider } from '@rnine/core';
import markSvg from './mark.svg?raw';

createRoot(root).render(
  <ThemeProvider
    mark={{ full: markSvg }}                  // your logo, drawn by Mark (default: a placeholder frame)
    mood={{ cookieDomain: 'example.com' }}    // optional: share the chosen mood across subdomains
  >
    <App />
  </ThemeProvider>,
);
```

The mood is saved in `localStorage` and a cookie, both named `mood` unless you pass
`mood={{ storageKey }}`. Auto follows the library's rule (Plain: the system's light/dark
setting; NineOS: light by day, dark at night for a dark system); `mood={{ auto }}`
overrides it. To have the right mood on the first paint, put the library's
`moodBootScript()` output (with the same key) in an inline `<script>` in your
`index.html` `<head>`.

```tsx
// anywhere
import { Button, Card, Section, TextField, useMood } from '@rnine/core';
import { Backdrop, Magnet, TextReveal } from '@rnine/core/motion';
```

```scss
// in any SCSS module
@use "@rnine/core/scss" as r9;

.button {
  @include r9.type(label);
  @include r9.corner(md);
  background: r9.$accent;
  color: r9.$on-accent;
  @include r9.up(md) { padding-inline: r9.$space-6; }
}
```

## Entry points

| Import | What |
|---|---|
| `@rnine/core` | Components, `ThemeProvider`, `MarkProvider`, `Mark`, mood and motion hooks (`useMood`, `configureMood`, `moodBootScript`, ...) |
| `@rnine/core/motion` | `TextReveal`, `useTextReveal`, `Backdrop`, `Mark`, `PageEffects`, `swapIn`/`swapOut`, `Magnet`, `TiltCard`, `Reveal`, `LiveClock`, `rippleAt` |
| `@rnine/core/styles.css` | Plain's tokens, base styles and every component's styles (one file) |
| `@rnine/core/scss` | The SCSS API, with Plain's tokens |
| `@rnine/core/tokens` | Plain's tokens as data |
| `@rnine/core/pages` | Static pages in Plain's look, for where React doesn't run (Workers, Node): `statusPage`, `emailLayout`, `emailTheme`, `markIcon`, `moodBootScript`, `themeColorMeta`, `pageFonts`; `createPages` for a library |
| `@rnine/core/kit` | For building a library: `ThemeRoot`, `ThemeConfigProvider`, `MarkArt`, `cx`, ... |
| `@rnine/core/build-tokens` | The token build tool (Node) |
| `@rnine/core/conformance` | Contract and contrast checks for a library's tests (Node) |
| `@rnine/core/base.css`, `components.css` | The parts of `styles.css` a library bundles after its own tokens |

## Build a library on core

A library has its own tokens (the same names as core's; color primitives are its own),
a `theme.json` (its name, its two moods' names, its Auto rule), its versions of the role
effects, and any components of its own. See [`@rnine/nineos`](../nineos) for a complete one:

- `scripts/build.mjs`: `buildTokens({ root, contract })` from `@rnine/core/build-tokens`
  (it fails if a token core components read is missing), then bundle `styles.css` as
  tokens, core's `base.css`, its own base, core's `components.css`, its own components.
- `src/index.ts`: `export * from '@rnine/core'`, then its own `ThemeProvider`
  (`<ThemeRoot config={...} />` from `@rnine/core/kit`), `Mark`, `moodBootScript`, and
  its additions. `src/motion.ts` likewise over `@rnine/core/motion`.
- `src/pages.ts`: `export * from '@rnine/core/pages'`, then its own
  `createPages({ tokens, css: tokensCss + PAGE_CSS, reveal })` (tokens and `css` from its
  own `/tokens` export; `reveal`: optional inline JS for the title effect). The fonts its
  static pages serve go in `theme.json` `fonts` (`id`, `family`, `weight`, `src`: a woff2
  package path).
- Tests: `contractProblems`, `contrastChecks` and `missingExports` (for `.`, `/motion` and
  `/pages`) from
  `@rnine/core/conformance`.

## Add a component to core

```
src/components/Name/
  Name.tsx            the component; props documented with JSDoc
  Name.module.scss    styles: only tokens and the shared mixins (@use "@rnine/core/scss" as r9)
  Name.stories.tsx    every state; the docs description names the component's accent element
  Name.test.tsx       behavior and accessible names (Testing Library)
```

Then export it from `src/index.ts`. Rules:

- Style with tokens and the shared mixins only, so every library's look applies: mood
  roles (never hex), `corner()` for shapes, `ornament()` for the accent mark.
- At least one accent element (`r9.$accent`), named in the story docs.
- Both moods work with no extra code.
- Motion only inside `@include r9.motion-safe`, or JS gated by `useReducedMotion()`.
- Visible labels, keyboard support, `:focus-visible` rings, 44px touch targets.
- Cut corners clip outlines: draw focus inside (`box-shadow: inset 0 0 0 2px r9.$accent`).

```bash
yarn workspace @rnine/core test     # component tests, Plain's contrast and keyframes
yarn workspace @rnine/core build    # tokens, then vite build, types, styles.css
```

Its stories show in the NineOS Storybook (`yarn workspace @rnine/nineos storybook`).

## Build output

`scripts/build.mjs` builds the tokens and `base.css`; `vite build` (library mode) writes one
ES module per source file to `dist/` (so apps only bundle what they import) and
`dist/components.css`; `tsc -p tsconfig.build.json` adds the type declarations; then
`scripts/build.mjs --bundle` writes `dist/styles.css`. React is a peer dependency;
lucide-react and dompurify stay external.
