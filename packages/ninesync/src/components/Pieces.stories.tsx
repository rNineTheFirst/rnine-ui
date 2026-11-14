import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Boxes, ClipboardList, LayoutDashboard, Truck } from 'lucide-react';
import { LiveDot } from './LiveDot/LiveDot';
import { SideNav } from './SideNav/SideNav';
import { Tabs } from './Tabs/Tabs';

const meta = {
  title: 'Components/NineSync only',
  parameters: {
    docs: {
      description: {
        component: 'Pieces only NineSync has, or has its own version of, from `@rnine/ninesync`: the live dot, and the tabs and side nav whose pale mark glides to what you pick.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LiveDotStory: Story = {
  name: 'LiveDot',
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <LiveDot>Synced just now</LiveDot>
      <LiveDot state="idle">Offline: changes are saved here and sent when you're back</LiveDot>
      <LiveDot title="Connected" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The one thing in NineSync that moves on its own: a green dot that sends out a soft ring every 3.2 s while data is live. `idle` is grey and still. Give it words (or a `title` when it stands alone): never color alone. Still with reduced motion.',
      },
    },
  },
};

const panel = (text: string) => <p style={{ color: 'var(--r9-fg-muted)', paddingTop: 16 }}>{text}</p>;

export const TabsStory: Story = {
  name: 'Tabs',
  render: () => (
    <Tabs
      label="Purchase orders"
      defaultValue="open"
      items={[
        { id: 'open', label: 'Open', content: panel('7 open orders, 3 awaiting approval.') },
        { id: 'received', label: 'Received', content: panel('42 received this month.') },
        { id: 'cancelled', label: 'Cancelled', content: panel('2 cancelled this month.') },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Core’s Tabs (arrow keys, Home, End) as plain text, with the pale mark under the selected tab. Pick another and the mark glides there (260 ms); with reduced motion it just moves.',
      },
    },
  },
};

function Nav() {
  const [page, setPage] = useState('materials');
  return (
    <div style={{ width: 256, background: 'var(--r9-surface)', borderRadius: 12, padding: '8px 0' }}>
      <SideNav
        activeKey={page}
        onSelect={setPage}
        groups={[
          {
            key: 'main',
            items: [
              { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
              { key: 'materials', label: 'Materials', icon: <Boxes /> },
              { key: 'orders', label: 'Purchase orders', icon: <ClipboardList />, badge: 3 },
              { key: 'suppliers', label: 'Suppliers', icon: <Truck /> },
            ],
          },
        ]}
      />
    </div>
  );
}

export const SideNavStory: Story = {
  name: 'SideNav',
  render: () => <Nav />,
  parameters: {
    docs: {
      description: {
        story: 'Core’s SideNav for AppShell’s sidebar. NineSync marks the current page with a pale bar under its name that glides to the page you pick (260 ms).',
      },
    },
  },
};
