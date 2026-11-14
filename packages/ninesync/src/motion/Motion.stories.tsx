import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card, StatTile } from '@rnine/core';
import { Cascade } from './Cascade';
import { CountUp } from './CountUp';
import { TextReveal } from './TextReveal';
import { swapIn, swapOut } from './swap';
import { pop, wash } from './wash';

const meta = {
  title: 'Motion/Effects',
  parameters: {
    docs: {
      description: {
        component:
          'The NineSync motion layer, from `@rnine/ninesync/motion`: subtle but alive. NineSync’s own effects in the shared roles (TextReveal draws its mark, swapIn/swapOut lift, PageEffects plays the screen cascade, the Backdrop is the still page, Mark is core’s), and its own (CountUp, wash, pop, Glide, Cascade). Nothing moves on its own except the live dot, and every effect stops when the system (or `ThemeProvider reducedMotion`, or the viewer’s Still) asks for less motion.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Reveal() {
  const [n, setN] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'start' }}>
      <TextReveal key={n} as="h2" text="Purchase orders" trigger="mount" />
      <TextReveal as="p" text="Hover me to draw the mark again" trigger="hover" />
      <Button size="sm" variant="secondary" onClick={() => setN((x) => x + 1)}>Play again</Button>
    </div>
  );
}

export const DrawTheMark: Story = {
  name: 'TextReveal: the mark draws',
  render: () => <Reveal />,
  parameters: { docs: { description: { story: 'The title rises 4px and fades in (260 ms), then its pale mark draws under the last word, left to right (420 ms). On hover only the mark draws again. Screen readers get the text as it is.' } } },
};

const PAGES = [
  ['Materials', '6 materials, 2 below their reorder point.'],
  ['Suppliers', '14 suppliers, 1 with an overdue delivery.'],
] as const;

function Lift() {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const next = async () => {
    if (ref.current) await swapOut(ref.current);
    setI((x) => (x + 1) % PAGES.length);
    requestAnimationFrame(() => ref.current && swapIn(ref.current));
  };
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start', maxWidth: 420 }}>
      <div ref={ref}>
        <Card interactive={false}>
          <h3 style={{ margin: 0 }}>{PAGES[i][0]}</h3>
          <p style={{ color: 'var(--r9-fg-muted)' }}>{PAGES[i][1]}</p>
        </Card>
      </div>
      <Button size="sm" variant="secondary" onClick={() => void next()}>Next page</Button>
    </div>
  );
}

export const LiftSwap: Story = {
  name: 'swapIn / swapOut: lift',
  render: () => <Lift />,
  parameters: { docs: { description: { story: 'Old content fades out (120 ms); new content rises 6px into place (220 ms).' } } },
};

function CascadeDemo() {
  const [n, setN] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <Cascade key={n}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', minWidth: 'min(36rem, 100%)' }}>
          <StatTile label="Open orders" value="7" />
          <StatTile label="Awaiting approval" value="3" tone="warning" />
          <StatTile label="Received this month" value="42" />
        </div>
      </Cascade>
      <Button size="sm" variant="secondary" onClick={() => setN((x) => x + 1)}>Play again</Button>
    </div>
  );
}

export const ScreenCascade: Story = {
  name: 'PageEffects: the screen cascade',
  render: () => <CascadeDemo />,
  parameters: { docs: { description: { story: 'Content marked `data-cascade`, or wrapped in `Cascade`, rises 8px and fades in block by block, 40 ms apart; table rows inside follow 18 ms apart. ThemeProvider’s PageEffects plays it.' } } },
};

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

function Count() {
  const [v, setV] = useState(1240500);
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start', maxWidth: 320 }}>
      <StatTile label="Stock value" value={<CountUp value={v} format={peso} />} hint="At last cost" />
      <Button size="sm" variant="secondary" onClick={() => setV((x) => x + 48500)}>Receive a delivery</Button>
    </div>
  );
}

export const CountUpStory: Story = {
  name: 'CountUp',
  render: () => <Count />,
  parameters: { docs: { description: { story: 'Counts up from zero when it first appears (700 ms), then ticks from the old value to the new one (420 ms). Screen readers get the final number.' } } },
};

function Feedback() {
  const card = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(3);
  const save = () => {
    setN((x) => x + 1);
    requestAnimationFrame(() => {
      wash(card.current);
      pop(badge.current);
    });
  };
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start', maxWidth: 420 }}>
      <div ref={card} style={{ padding: 16, borderRadius: 12, border: '1px solid var(--r9-line)', background: 'var(--r9-surface)' }}>
        PO-1042 · Steel plate, 6 mm · <span ref={badge} style={{ display: 'inline-block', fontWeight: 600 }}>{n} lines</span>
      </div>
      <Button size="sm" onClick={save}>Add a line and save</Button>
    </div>
  );
}

export const WashAndPop: Story = {
  name: 'wash and pop: after a save',
  render: () => <Feedback />,
  parameters: { docs: { description: { story: '`wash(el)` gives what changed a pale wash that fades over 1.2 s (for a table row, its cells); `pop(el)` scales a badge or count that changed to 118% and back (300 ms). Nothing is left on the element.' } } },
};
