import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDown, Plus, Printer } from 'lucide-react';
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs';
import { Button } from '../Button/Button';
import { Menu } from '../Menu/Menu';
import { Status } from '../Tag/Tag';
import { PageHeader } from './PageHeader';

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  args: {
    title: 'Purchase orders',
    description: 'Orders to suppliers, from draft to received.',
    actions: <Button iconStart={<Plus size={18} />}>New order</Button>,
  },
  parameters: {
    docs: {
      description: {
        component:
          'The top of an app page: breadcrumbs, the title (the page’s `h1`) with its status, a description and the page’s actions, which wrap under the title on narrow screens. **Accent element:** the mark after the title.',
      },
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {};

/** A record: breadcrumbs back to the list, its status, and its actions. */
export const Record: Story = {
  args: {
    title: 'PO-2026-0042',
    breadcrumbs: <Breadcrumbs items={[{ label: 'Purchasing', href: '#' }, { label: 'Purchase orders', href: '#' }, { label: 'PO-2026-0042' }]} />,
    meta: <Status tone="warning">Awaiting approval</Status>,
    description: 'Northwind Metals · due Nov 20 · ₱184,200.00',
    actions: (
      <>
        <Button variant="ghost" iconStart={<Printer size={18} />}>Print</Button>
        <Menu
          align="end"
          trigger={<Button variant="outline" iconEnd={<ChevronDown size={18} />}>More</Button>}
          items={[{ key: 'dup', label: 'Duplicate' }, { kind: 'separator', key: 's' }, { key: 'cancel', label: 'Cancel order', tone: 'danger' }]}
        />
        <Button>Approve</Button>
      </>
    ),
  },
};

export const TitleOnly: Story = { args: { description: undefined, actions: undefined } };
