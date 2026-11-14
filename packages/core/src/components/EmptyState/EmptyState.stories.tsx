import type { Meta, StoryObj } from '@storybook/react-vite';
import { ClipboardList, SearchX } from 'lucide-react';
import { Button } from '../Button/Button';
import { Table } from '../Table/Table';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  args: {
    title: 'No purchase orders yet',
    description: 'Orders you create show up here, with their approval and delivery status.',
    icon: <ClipboardList />,
    action: <Button>Create order</Button>,
  },
  parameters: {
    docs: {
      description: {
        component:
          'What an empty list, table or search shows: what is empty, why, and what to do next. `size="sm"` fits a Table’s `emptyMessage`, a drawer or a card. **Accent element:** the mark on the icon’s frame (above the title without an icon).',
      },
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstUse: Story = {};

export const NoResults: Story = {
  args: {
    title: 'No materials match “m12 bolt”',
    description: 'Check the spelling, or clear the category filter.',
    icon: <SearchX />,
    action: <Button variant="outline">Clear filters</Button>,
  },
};

export const WithoutIcon: Story = { args: { icon: undefined, action: undefined, title: 'Nothing to approve', description: 'Orders waiting for you show up here.' } };

/** Small, as a Table's empty message. */
export const InTable: Story = {
  render: () => (
    <Table
      data={[] as { id: string }[]}
      columns={[{ key: 'id', header: 'Order' }, { key: 'supplier', header: 'Supplier' }, { key: 'total', header: 'Total', align: 'end' }]}
      keyExtractor={(o) => o.id}
      caption="Purchase orders"
      emptyMessage={
        <EmptyState size="sm" icon={<SearchX />} title="No orders match “bolts”" description="Try another word." action={<Button variant="outline" size="sm">Clear search</Button>} />
      }
    />
  ),
};
