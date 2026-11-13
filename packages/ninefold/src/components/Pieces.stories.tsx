import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FieldJournal } from './FieldJournal/FieldJournal';
import { LanternTrail } from './LanternTrail/LanternTrail';
import { MoonDial } from './MoonDial/MoonDial';
import { PenLink } from './PenLink/PenLink';

const meta = {
  title: 'Components/Ninefold only',
  parameters: {
    docs: {
      description: {
        component: 'Pieces only Ninefold has, from `@rnine/ninefold`: the lantern trail, the field journal, the moon dial and the pen link.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const STOPS = [
  { id: 'new', label: 'New' },
  { id: 'editions', label: 'Editions' },
  { id: 'preorders', label: 'Preorders' },
  { id: 'contact', label: 'Write to us' },
];

function Trail() {
  const [open, setOpen] = useState<string | null>('new');
  return (
    <div style={{ display: 'grid', gap: 24, paddingTop: 40 }}>
      <LanternTrail label="Shop sections" stops={STOPS} value={open} onChange={setOpen} />
      <p style={{ color: 'var(--r9-fg-muted)' }}>Open: {STOPS.find((s) => s.id === open)?.label ?? 'nothing yet'}</p>
    </div>
  );
}

export const LanternTrailStory: Story = {
  name: 'LanternTrail',
  render: () => <Trail />,
  parameters: {
    docs: {
      description: {
        story:
          'Navigation as a trail. Pick a stop and the lantern walks there (speed 1.2x), lighting the path behind it, with a few motes (fireflies at night) rising from it; `onChange` fires when it arrives, so the page opens then. A tab list: arrow keys, Home and End. Pass `controls` with the id of the panel it opens. Four stops fit best; two to six work. With reduced motion the lantern is simply there.',
      },
    },
  },
};

export const FieldJournalStory: Story = {
  name: 'FieldJournal',
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <FieldJournal
        every={4}
        entries={[
          { text: 'Unpacked forty copies of The Cartographer of Ash.', icon: 'leaf' },
          { text: 'A reader asked for a book about moths. We had two.', icon: 'moth' },
          { text: 'The moon is {moon}. Preorders close at midnight.', icon: 'moon' },
          { text: 'Three fireflies by the window while wrapping orders.', icon: 'firefly' },
        ]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dated notes in a hand, with a small sketch each (leaf, moth, moon, firefly). Every `every` seconds (default 6.5; 4 here) while it’s on screen, the oldest folds away and a new note writes itself in, word by word. `{moon}` becomes tonight’s phase. Still with reduced motion.',
      },
    },
  },
};

export const MoonDialStory: Story = {
  name: 'MoonDial',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48 }}>
      <MoonDial />
      <MoonDial date={new Date(2026, 10, 24, 21, 15)} />
      <MoonDial date={new Date(2026, 10, 24, 10, 30)} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The sun crosses the arc by day and the moon by night, in its real phase. Now, then a fixed night and a fixed morning (`date`). Screen readers get one sentence: the phase, how much is lit, and the time.',
      },
    },
  },
};

export const PenLinkStory: Story = {
  name: 'PenLink',
  render: () => (
    <nav aria-label="Sample" style={{ display: 'flex', gap: 24, fontSize: '1.0625rem' }}>
      <PenLink href="#" current>New</PenLink>
      <PenLink href="#">Special editions</PenLink>
      <PenLink href="#">Preorders</PenLink>
    </nav>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Hover or tab to a link: a pen stroke draws under it, left to right, and ends in an ink drop (500 ms). It stays under the current page (`current`). In SCSS, any element: `@include r9.pen-underline`.',
      },
    },
  },
};
