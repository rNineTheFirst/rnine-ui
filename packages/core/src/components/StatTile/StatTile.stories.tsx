import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertTriangle, Coins, PackageCheck, Timer } from 'lucide-react';
import { StatTile } from './StatTile';

const meta = {
  title: 'Components/StatTile',
  component: StatTile,
  args: { label: 'Stock value', value: '₱1,240,500', change: { value: '4.2%', direction: 'up' }, hint: 'vs last month', icon: <Coins /> },
  parameters: {
    docs: {
      description: {
        component:
          'One number for a dashboard: label, value, change and hint, as a card, optionally a link to the list behind it. The change reads as an arrow and words (“Up 4.2%”), and its color (`tone`) is separate from its direction: more items below the reorder point is up but bad. `loading` shows skeletons. **Accent element:** the card’s corner ornament.',
      },
    },
  },
  decorators: [(Story, { parameters }) => (parameters.wide ? <Story /> : <div style={{ maxWidth: '18rem' }}><Story /></div>)],
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A count that needs action: the value in the warning color, and a link to the list. */
export const NeedsAction: Story = {
  args: { label: 'Items below reorder point', value: '7', tone: 'warning', change: { value: '+2', direction: 'up', tone: 'negative' }, hint: 'since Monday', icon: <AlertTriangle />, href: '#materials' },
};

export const Loading: Story = { args: { loading: true } };

/** A dashboard row. */
export const Row: Story = {
  parameters: { wide: true },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--r9-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))' }}>
      <StatTile label="Stock value" value="₱1,240,500" change={{ value: '4.2%', direction: 'up' }} hint="vs last month" icon={<Coins />} />
      <StatTile label="Below reorder point" value="7" tone="warning" change={{ value: '+2', direction: 'up', tone: 'negative' }} icon={<AlertTriangle />} href="#" />
      <StatTile label="Awaiting approval" value="3" hint="oldest 4 days" icon={<Timer />} href="#" />
      <StatTile label="Deliveries this week" value="5" change={{ value: '0', direction: 'flat' }} icon={<PackageCheck />} />
    </div>
  ),
};
