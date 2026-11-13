# @rnine/ninefold

**Docs and every component, live: [ui.rnine.dev/ninefold](https://ui.rnine.dev/ninefold/)** (Storybook)

Ninefold: a cozy-fantasy design system library for React, built on [`@rnine/core`](../core).
Two moods: **Glint** by day (honey paper, iron-gall ink, claret wax, falling leaves) and
**Gloam** by night (a walnut desk by candlelight, rose ink, fireflies). Soft corners, with
cards whose top-right corner is folded over and lifts toward the pointer; a wax seal for
the mark; pressed paper behind everything. Made for shops and sites with a little magic in
them: bookshops, makers, tea rooms, games.

It exports everything `@rnine/core` does, with the same props, in the Ninefold look, plus
its own pieces:

- **Its effects in the shared roles**: `TextReveal` grows letters up from the line by day
  and gathers fireflies into the words at night; `Backdrop` is falling leaves by day and
  fireflies by night (they circle the pointer, scatter on a quick move and flash in a ring
  on a click or `rippleAt`); `Mark` is the app's mark pressed into a wax seal with a sprig
  behind it (two fireflies circle it at night); `swapIn`/`swapOut` are the swarm swap
  (fireflies or leaves carry one panel off and bring the next); `PageEffects` are click
  bursts of leaves or fireflies, and dew catching the light by day.
- **Core pieces in its look**: `Card` and `TiltCard` (the folded corner that lifts, a warm
  light that follows the pointer), `Button` (a wax-stamp press; `secondary` is a quiet
  outline, `ghost` gets the pen underline), `Magnet` (a gentler pull).
- **Ninefold only**: `LanternTrail` (navigation: a lantern walks to the stop you pick, and
  its page opens when it arrives), `FieldJournal` (dated notes that write themselves in),
  `MoonDial` (the sun or the moon on its arc, in today's real phase) and `PenLink` in the
  main entry; `HeroLight` (window light by day; candle glow and a starry sky at night) and
  `Ink` (opt-in: drag on empty paper and a broad-nib pen writes in ink that dries and
  fades) in `/motion`. In SCSS: `pen-underline()`, `wax-drop()`, and Ninefold's roles
  (`$wax`, `$lining`, `$ink-wet`, `$mote`, `$leaf`, `$star`, `$light`, `$font-script`, ...).

```bash
yarn workspace @rnine/ninefold storybook          # Storybook on http://localhost:6007 (Ninefold and core stories)
yarn workspace @rnine/ninefold test               # component and conformance tests
yarn workspace @rnine/ninefold build-storybook    # static Storybook in storybook-static/
yarn workspace @rnine/ninefold dev-kit            # the brand kit on http://localhost:5177 (kit/)
yarn workspace @rnine/ninefold build-kit          # the brand kit in kit/dist/
```

## Use it in an app

```bash
npm install @rnine/ninefold react react-dom    # sass too, to use the SCSS API
```

```tsx
// entry file, once
import '@rnine/ninefold/fonts.css';    // Fraunces, Literata, Courier Prime, Pinyon Script (self-hosted, OFL)
import '@rnine/ninefold/styles.css';   // tokens, Glint/Gloam switching, base styles, the paper, every component
import { ThemeProvider } from '@rnine/ninefold';
import markSvg from './mark.svg?raw';

createRoot(root).render(
  <ThemeProvider mark={{ full: markSvg }}>
    <App />
  </ThemeProvider>,
);
```

Auto shows Glint by day (06:00-18:00, the viewer's time) and, at night, Gloam for a dark
system setting, until the viewer chooses. Put `moodBootScript()`'s output in an inline
`<script>` in your `index.html` `<head>` for the right mood on the first paint.

The paper (pressed fibers and a fine grain) is drawn on `body::before` and `body::after`,
fixed behind the page. The page's color comes from `body` (styles.css sets it). Don't also
give `html` a background, or cover the page with a full-size wrapper that has one: either
paints over the paper.

```tsx
import { Button, Card, LanternTrail, MoonDial, FieldJournal } from '@rnine/ninefold';
import { Backdrop, HeroLight, Ink, TextReveal } from '@rnine/ninefold/motion';

<section style={{ position: 'relative' }}>
  <HeroLight />
  <TextReveal as="h1" text="Books with a little magic bound in." trigger="mount" />
  <Ink />  {/* opt-in: the hero can be written on */}
</section>

<LanternTrail
  label="Shop sections"
  stops={[{ id: 'new', label: 'New' }, { id: 'editions', label: 'Editions' }]}
  value={section}
  onChange={setSection}   // called when the lantern arrives
/>
```

`Ink` never starts on text (a drag there selects it, as always), links, buttons, fields or
cards; mark anything else that should stay clear of it with `data-ink-off`.

Status and error pages, emails and app icons in the Ninefold look, for where React doesn't
run, come from `@rnine/ninefold/pages` (the same calls as `@rnine/core/pages`).

```scss
// in any SCSS module
@use "@rnine/ninefold/scss" as r9;

.note {
  @include r9.type(body);
  @include r9.corner(md);          // Ninefold: softly rounded
  background: r9.$surface-raised;
}

.nav a { @include r9.pen-underline; }
.stop::before { content: ""; @include r9.wax-drop(10px); }
```

## The feel, tuned

These defaults were tuned by eye; most can be changed by prop.

| What | Default |
| --- | --- |
| Fireflies (night) / leaves (day) | 0.5x / 0.4x per area, leaves at 0.6x size; `Backdrop gap` scales both |
| Fireflies | brightness 0.5x, circle the pointer 0.1x, scatter on a quick move 0.2x, a flash wave every 5 s after 5.2 s at rest |
| Title gather (night) | 480 fireflies over 1100 ms (`TextReveal duration`) |
| Title grow (day) | 640 ms a letter, 10 ms between letters |
| Folded corner | 26 px at rest, lifts to 60 px from 450 px away, follows at 0.4 (`ThemeConfig lift`) |
| Pen (Ink) | 2 px (`width`), the ink stays 1 s (`stays`), touch: hold 300 ms (`hold`) |
| Lantern trail | walking speed 1.2x (`speed`), a mote behind the lantern on 20% of frames |
| Swarm swap | 80 fireflies or leaves, at 0.8x the base timings |
| Wax stamp | the ring spreads to 2.4x; the seal's sprig sways 8° |
| Pen underline | 500 ms (`pen-underline($speed)`) |
| Night sky (HeroLight) | 0.8x stars (`stars`) |
| Click burst | 5 leaves, or 6 fireflies |
| Field journal | a note every 6.5 s (`every`) |
| Hero light | window 0.6x (`window`), candle glow 0.9x (`glow`), flicker 0.5 (`flicker`) |

Every effect stops when the system asks for reduced motion, or when the viewer chooses
Still (`MotionToggle`), or with `ThemeProvider reducedMotion`.

## License

MIT. The fonts are under the SIL Open Font License, through Fontsource.
