import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Backdrop } from './Backdrop';
import { Mark } from './Mark';
import { TextReveal } from './TextReveal';
import { swapIn, swapOut } from './swap';
import { Button } from '../components/Button/Button';
import { Card } from '../components/Card/Card';
import { HeroLight } from '../components/HeroLight/HeroLight';
import { Ink } from '../components/Ink/Ink';
import { Magnet } from '../components/Magnet/Magnet';

const meta = {
  title: 'Motion/Effects',
  parameters: {
    docs: {
      description: {
        component:
          'The Ninefold motion layer, from `@rnine/ninefold/motion`: Ninefold’s own effects in the shared roles (TextReveal, Backdrop, Mark, swapIn/swapOut, PageEffects), and its own (HeroLight, Ink). Day and night differ: switch Glint and Gloam in the toolbar. Every effect answers the person using the page or drifts slowly enough to ignore, and every one stops when the system (or `ThemeProvider reducedMotion`, or the viewer’s Still) asks for less motion.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const box = { position: 'relative', height: 360, background: 'var(--r9-surface)', borderRadius: 12, overflow: 'hidden' } as const;

export const LeavesAndFireflies: Story = {
  name: 'Backdrop: leaves and fireflies',
  render: () => (
    <div style={box}>
      <Backdrop />
    </div>
  ),
  parameters: { docs: { description: { story: 'Fills its positioned parent. By day leaves drift down and the pointer is a breeze through them; at night fireflies circle the pointer, scatter on a quick move, flash in a ring from a click (or `rippleAt`) and in a slow wave every 5 s while the pointer rests. `fixed` puts it behind the whole page.' } } },
};

export const GrowAndGather: Story = {
  name: 'TextReveal: grow and gather',
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <TextReveal as="h2" text="Books with a little magic bound in." trigger="mount" />
      <TextReveal as="p" text="Hover me to see it again" trigger="hover" />
    </div>
  ),
  parameters: { docs: { description: { story: 'By day the letters grow up from the line (10 ms apart); at night fireflies gather into the shape of the words (480 of them, 1100 ms) and the words appear where they settle. The real text holds its place; screen readers get it as it is.' } } },
};

export const Seal: Story = {
  name: 'Mark: the seal',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
      <Mark size={120} animate="mount" label="The shop’s seal" />
      <Mark size={64} />
      <Mark size={40} />
      <Mark size={24} />
    </div>
  ),
  parameters: { docs: { description: { story: 'The app’s mark pressed into poured wax (two fireflies circle it at night). Hover to press it again: a squash and a foil glint. `animate="mount"` drops the wax first. At 40 px and below it’s the small seal: no gloss, the mark’s simplified version, smaller and lighter.' } } },
};

function Swap() {
  const [page, setPage] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const next = async () => {
    if (ref.current) await swapOut(ref.current);
    setPage((p) => (p + 1) % 3);
    requestAnimationFrame(() => ref.current && swapIn(ref.current));
  };
  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 520 }}>
      <div ref={ref} style={{ padding: 24, background: 'var(--r9-surface)', borderRadius: 12 }}>
        <h3 style={{ margin: 0 }}>{['New on the shelf', 'Special editions', 'Preorders'][page]}</h3>
        <p style={{ color: 'var(--r9-fg-muted)' }}>Page {page + 1} of 3: carried off and brought in by the swarm.</p>
      </div>
      <div><Button onClick={next}>Next page</Button></div>
    </div>
  );
}

export const SwarmSwap: Story = {
  name: 'swapIn / swapOut: the swarm',
  render: () => <Swap />,
  parameters: { docs: { description: { story: '`await swapOut(el)`, change the content, then `swapIn(el)`. The old page blurs away as 80 fireflies (night) or leaves (day) lift off it; the new one gathers out of them.' } } },
};

export const FoldAndStamp: Story = {
  name: 'Folded corner, wax stamp, magnet',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, alignItems: 'start' }}>
      <Card>
        <h3 style={{ margin: 0 }}>The Moth Archivist</h3>
        <p style={{ color: 'var(--r9-fg-muted)', margin: 0 }}>Move toward the top-right corner: the fold lifts from 26 to 60 px, starting 450 px away.</p>
      </Card>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 24 }}>
        <Magnet><Button>Press me</Button></Magnet>
        <Magnet><Button variant="secondary">Or me</Button></Magnet>
        <Button variant="ghost">A pen underline</Button>
      </div>
    </div>
  ),
  parameters: { docs: { description: { story: 'Cards lift their folded corner toward the pointer (a tap lifts it on touch). Buttons press like a seal: a squash and a ring of wax (2.4x). Magnet leans a button up to 7 px toward the pointer.' } } },
};

export const HeroLightStory: Story = {
  name: 'HeroLight',
  render: () => (
    <section style={{ ...box, height: 320, display: 'grid', alignContent: 'center', padding: 40 }}>
      <HeroLight />
      <h2 style={{ position: 'relative', margin: 0 }}>Light over a hero</h2>
    </section>
  ),
  parameters: { docs: { description: { story: 'By day, sun through a window falls across the hero and drifts (`window`, 0.6); at night a candle glows in the corner, breathing (`glow` 0.9, `flicker` 0.5), and stars come out across the top, flowing aside when the pointer passes (`stars` 0.8). Put it first inside a positioned hero.' } } },
};

export const InkStory: Story = {
  name: 'Ink: write on the page',
  render: () => (
    <div style={{ ...box, height: 300, padding: 32 }}>
      <Ink hint="Drag on the empty paper to write. The ink fades." />
      <p style={{ position: 'relative', margin: 0, maxWidth: '40ch' }}>Drag on the empty paper around this text to write. A drag on the text still selects it. On touch, press and hold first.</p>
      <p style={{ position: 'relative', marginTop: 16 }}><a href="#">A link stays a link</a></p>
    </div>
  ),
  parameters: { docs: { description: { story: 'Opt-in. A broad-nib pen (2 px) in wet ink that dries and fades after 1 s. Writing starts only on paper: never on text, links, buttons, fields or cards, nor inside `[data-ink-off]`; it never selects text. Off with reduced motion.' } } },
};
