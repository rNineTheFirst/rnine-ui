# @rnine/ninesync

**Docs and every component, live: [ui.rnine.dev/ninesync](https://ui.rnine.dev/ninesync/)** (Storybook).
**Check a client's colors with the builder in the brand kit (`kit/`, linked from the Storybook).**

NineSync: a calm design system library for React, for internal tools and dashboards
(inventory, purchasing, back offices). It's built on [`@rnine/core`](../core) and wears the
client's own color. Two moods, **Light** and **Dark**. DM Sans throughout, figures in DM Mono
that line up. 12px corners. A pale **mark** under titles, tabs and the current page. A soft
glow on hover. Motion that's subtle but alive.

Its starting point is Sync UI's look: the tight DM Sans headlines, the `<mark>` underline
that thickens with the type, outline buttons with light-blue borders, and the three-layer
glow.

It exports everything `@rnine/core` does, with the same props, in the NineSync look, plus
its own pieces.

**Client colors.** One brand color in. Out come the accent roles for both moods, greys
tinted toward its hue, the pale mark and the glow.

- `ClientTheme` puts them on the page.
- `syncColors()` returns them with plain-language checks.
- The checks come from core's `clientAccent` (text and button text 4.5:1, button fill 3:1,
  the pale tone on cards, a hue near the error red or success green).
- A client's color is never changed to pass. When it fails in a mood, the check asks for a
  second color for that mood and suggests one. The suggestion stands in until the client
  gives one.

**Its effects in the shared roles:**

- `TextReveal`: the title rises 4px and fades in, then its mark draws under the last word.
- `swapIn`/`swapOut`: lift. Old content fades out (120ms); new content rises 6px into place
  (220ms).
- `PageEffects`: the screen cascade. Content marked `data-cascade`, or wrapped in
  `Cascade`, rises in block by block, 40ms apart.
- `Backdrop`: the still page.
- `Mark`: core's, still.

**Core pieces in its look:**

- `Tabs` and `SideNav`: the pale mark glides to the tab or page you pick (260ms).
- `PageHeader`: a text title draws its mark.
- Every button, field, link card and linked stat tile glows on hover: quick in (160ms),
  Sync's slow fade out (300ms).
- Buttons dip to 97% when pressed. `secondary` is Sync's outlined button with a pale border.
- Focus rings settle in from 6px out (160ms).
- Loading placeholders get a pale sheen, toasts a pale timer line, and drawers slide in
  24px.
- Cards don't tilt. Core's accent dots are gone: the mark is NineSync's accent element.

**NineSync only:**

- `ClientTheme`, `syncColors`, `clientThemeCss` (the client colors) and `LiveDot`, the
  "synced" dot. It sends out a soft ring every 3.2s and is the only thing that moves on its
  own.
- In `/motion`: `CountUp` (counts up when it appears, ticks from old to new on a change),
  `wash()` and `pop()` (feedback after a save), `Glide` and `Cascade`.
- In SCSS: `glow`, `glow-hover`, `press-dip`, `mark-under`, and NineSync's roles (`$mark`,
  `$mark-soft`, `$mark-line`, `$glow`, `$fg-strong`, ...).

```bash
yarn workspace @rnine/ninesync storybook          # Storybook on http://localhost:6009 (NineSync and core stories)
yarn workspace @rnine/ninesync test               # component and conformance tests
yarn workspace @rnine/ninesync build              # dist/ (tokens, styles.css, ES modules, types)
yarn workspace @rnine/ninesync build-storybook    # static Storybook in storybook-static/
yarn workspace @rnine/ninesync dev-kit            # the brand kit with the client color builder on http://localhost:5181 (kit/)
yarn workspace @rnine/ninesync build-kit          # the brand kit in kit/dist/
node scripts/themes.mts                           # rewrite tokens/themes/*.json after changing syncColors or SYNC_BASE
```

## Use it in an app

```bash
npm install @rnine/ninesync react react-dom    # sass too, to use the SCSS API
```

```tsx
// entry file, once
import '@rnine/ninesync/fonts.css';    // DM Sans and DM Mono (self-hosted, OFL)
import '@rnine/ninesync/styles.css';   // tokens, Light/Dark switching, base styles, every component
import { ClientTheme, ThemeProvider } from '@rnine/ninesync';

createRoot(root).render(
  <ThemeProvider mark={{ full: logoSvg }}>
    <ClientTheme colors={{ brand: '#0B6E4F', dark: '#5FD3A8' }} />
    <App />
  </ThemeProvider>,
);
```

Without `ClientTheme` the app is in the default colors: Sync UI's blue (`#2B4D82`), with
its light blue (`#A2C4F6`) as the dark mood's second color.

Auto follows the system setting until the viewer chooses. For the right mood on the
first paint, put `moodBootScript()`'s output in an inline `<script>` in your
`index.html` `<head>`.

Check a client's colors before using them:

```ts
import { syncColors } from '@rnine/ninesync';

const { light, dark, ok } = syncColors({ brand: '#F07F13' });
// ok: false
// light.checks[0].message: "#F07F13 reads at 2.4:1 as text here; it needs 4.5:1.
//   Ask the client for a darker color for the light mood, such as #A3560D."
```

```tsx
import { AppShell, LiveDot, PageHeader, SideNav, StatTile, Tabs } from '@rnine/ninesync';
import { Cascade, CountUp, wash } from '@rnine/ninesync/motion';

<AppShell nav={<SideNav groups={groups} activeKey="materials" footer={<LiveDot>Synced 2 min ago</LiveDot>} />}>
  <Cascade>
    <PageHeader title="Raw materials" actions={<Button>New purchase order</Button>} />
    <StatTile label="Stock value" value={<CountUp value={1240500} format={usd} />} />
    <Tabs label="Materials" items={tabs} />
  </Cascade>
</AppShell>

// after a save
wash(rowRef.current);
```

Status and error pages, emails and app icons in the NineSync look, for where React
doesn't run, come from `@rnine/ninesync/pages` (the same calls as `@rnine/core/pages`).

```scss
// in any SCSS module
@use "@rnine/ninesync/scss" as r9;

.panel {
  border-radius: r9.$corner-lg;    // 12px (corner()'s clip-path would hide the glow)
  @include r9.glow-hover;
  background: r9.$surface;
}

.title mark { @include r9.mark-under; }
```

## The motion

| Where | What |
| --- | --- |
| Page title (`TextReveal`) | Rises 4px and fades in (260ms), then the mark draws left to right (420ms). |
| Tabs, side nav (`Glide`) | The mark glides to the new tab or page (260ms). |
| Content swap | Fades out (120ms); the new content rises 6px into place (220ms). |
| Screen entry (`PageEffects`) | Blocks rise 8px, 40ms apart; table rows fade in 18ms apart. |
| Numbers (`CountUp`) | Count up on entry (700ms, easing out); a change ticks from the old value (420ms). |
| Hover | The glow arrives in 160ms and leaves in 300ms. |
| Press | Buttons dip to 97% (90ms). |
| Focus | The ring settles in from 6px out (160ms); fields grow a pale ring. |
| After a save (`wash`, `pop`) | A pale wash fades over 1.2s; a changed badge pops once. |
| Drawer, toast | The drawer slides 24px in; toasts rise in with a pale timer line. |
| Loading | A pale sheen sweeps across placeholders (1.5s loop). |
| Ambient (`LiveDot`) | The synced dot sends out a soft ring every 3.2s. |

With reduced motion (the system setting, `MotionToggle`, or `ThemeProvider reducedMotion`)
all of it stops and everything shows at rest.

MIT. DM Sans and DM Mono are under the SIL Open Font License.
