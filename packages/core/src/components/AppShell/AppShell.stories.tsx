import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  Boxes,
  ClipboardList,
  FileClock,
  LayoutDashboard,
  MoreHorizontal,
  PackageCheck,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Truck,
  Users,
} from 'lucide-react';
import { Avatar } from '../Avatar/Avatar';
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs';
import { Button } from '../Button/Button';
import { EmptyState } from '../EmptyState/EmptyState';
import { TextField } from '../Field/Field';
import { Menu } from '../Menu/Menu';
import { PageHeader } from '../PageHeader/PageHeader';
import { StatTile } from '../StatTile/StatTile';
import { Table, type Column } from '../Table/Table';
import { Status } from '../Tag/Tag';
import { AppShell } from './AppShell';
import { SideNav, type SideNavGroup } from './SideNav';

const ROLES = ['Clerk', 'Approver', 'Admin'] as const;
type Role = (typeof ROLES)[number];

const groups = (role: Role): SideNavGroup[] => [
  {
    key: 'main',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard />, href: '#dashboard' },
      { key: 'materials', label: 'Materials', icon: <Boxes />, href: '#materials' },
      { key: 'suppliers', label: 'Suppliers', icon: <Truck />, href: '#suppliers' },
    ],
  },
  {
    key: 'purchasing',
    label: 'Purchasing',
    items: [
      { key: 'orders', label: 'Purchase orders', icon: <ClipboardList />, href: '#orders', badge: 3, badgeLabel: '3 awaiting approval' },
      { key: 'receiving', label: 'Receiving', icon: <PackageCheck />, href: '#receiving' },
      { key: 'adjustments', label: 'Stock adjustments', icon: <SlidersHorizontal />, href: '#adjustments' },
    ],
  },
  {
    key: 'admin',
    label: 'Admin',
    items: [
      { key: 'audit', label: 'Audit log', icon: <FileClock />, href: '#audit', disabled: role === 'Clerk' },
      { key: 'users', label: 'Users & permissions', icon: <Users />, href: '#users', disabled: role !== 'Admin' },
      { key: 'settings', label: 'Settings', icon: <Settings />, href: '#settings', disabled: role !== 'Admin' },
    ],
  },
];

type Order = { id: string; supplier: string; status: 'Draft' | 'Awaiting approval' | 'Approved'; total: string; due: string };

const ORDERS: Order[] = [
  { id: 'PO-2026-0042', supplier: 'Northwind Metals', status: 'Awaiting approval', total: '₱184,200.00', due: 'Nov 20' },
  { id: 'PO-2026-0041', supplier: 'Bolt & Nut Co.', status: 'Approved', total: '₱12,480.00', due: 'Nov 18' },
  { id: 'PO-2026-0040', supplier: 'Coastal Welding Supply', status: 'Draft', total: '₱36,900.00', due: 'Nov 25' },
];

const TONE = { Draft: 'idle', 'Awaiting approval': 'warning', Approved: 'success' } as const;

const columns: Column<Order>[] = [
  { key: 'id', header: 'Order', sortable: true },
  { key: 'supplier', header: 'Supplier', sortable: true },
  { key: 'status', header: 'Status', render: (o) => <Status tone={TONE[o.status]}>{o.status}</Status> },
  { key: 'total', header: 'Total', align: 'end' },
  { key: 'due', header: 'Due', align: 'end' },
  {
    key: 'actions',
    header: 'Actions',
    align: 'end',
    render: (o) => (
      <Menu
        align="end"
        label={`Actions for ${o.id}`}
        trigger={<Button variant="ghost" size="sm" aria-label={`Actions for ${o.id}`} iconStart={<MoreHorizontal size={18} />} />}
        items={[
          { key: 'open', label: 'Open' },
          { key: 'print', label: 'Print' },
          { kind: 'separator', key: 's' },
          { key: 'cancel', label: 'Cancel order', tone: 'danger', disabled: o.status === 'Approved' },
        ]}
      />
    ),
  },
];

function UserMenu({ role, onRole }: { role: Role; onRole: (role: Role) => void }) {
  return (
    <Menu
      align="end"
      trigger={
        <Button variant="ghost" size="sm" aria-label={`Account: Maria Reyes, ${role}`}>
          <Avatar name="Maria Reyes" size="sm" />
        </Button>
      }
      header={
        <>
          <strong>Maria Reyes</strong>
          <br />
          {role}
        </>
      }
      items={[
        { kind: 'group', key: 'role', label: 'Switch role', items: ROLES.map((r) => ({ key: r, label: r, selected: r === role, onSelect: () => onRole(r) })) },
        { kind: 'separator', key: 's' },
        { key: 'out', label: 'Sign out' },
      ]}
    />
  );
}

function AppDemo({ empty = false }: { empty?: boolean }) {
  const [active, setActive] = useState('orders');
  const [role, setRole] = useState<Role>('Approver');
  return (
    <AppShell
      brand={<strong>Acme Fabrication</strong>}
      nav={
        <SideNav
          groups={groups(role)}
          activeKey={active}
          onSelect={setActive}
          footer={<Button variant="ghost" size="sm">Reset demo data</Button>}
        />
      }
      header={<TextField label="Search" hideLabel placeholder="Search orders, materials, suppliers" type="search" />}
      actions={<UserMenu role={role} onRole={setRole} />}
    >
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ label: 'Purchasing', href: '#' }, { label: 'Purchase orders' }]} />}
        title="Purchase orders"
        description="Orders to suppliers, from draft to received."
        actions={<Button iconStart={<Plus size={18} />}>New order</Button>}
      />
      <div style={{ display: 'grid', gap: 'var(--r9-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', marginBottom: 'var(--r9-space-6)' }}>
        <StatTile label="Awaiting approval" value="3" tone="warning" href="#orders" hint="oldest 4 days" />
        <StatTile label="Open order value" value="₱233,580" change={{ value: '8.1%', direction: 'up' }} hint="vs last month" />
        <StatTile label="Deliveries due this week" value="5" change={{ value: '2', direction: 'down', tone: 'neutral' }} />
      </div>
      <Table
        data={empty ? [] : ORDERS}
        columns={columns}
        keyExtractor={(o) => o.id}
        caption="Purchase orders"
        hideCaption
        emptyMessage={
          <EmptyState
            size="sm"
            icon={<Search />}
            title="No orders match “bolts”"
            description="Try another word, or clear the filters."
            action={<Button variant="outline" size="sm">Clear filters</Button>}
          />
        }
      />
    </AppShell>
  );
}

const meta = {
  title: 'Components/AppShell',
  component: AppShell,
  args: { nav: null, children: null },
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, iframeHeight: 720 },
      description: {
        component:
          'The layout of an internal tool or admin app: `SideNav` in the sidebar, a top bar (`header` for search, `actions` for the user `Menu`) and the page, which usually starts with a `PageHeader`. From the md breakpoint the sidebar is always shown; below it, the menu button slides it in (Escape, the close button, a tap outside or picking a page closes it). A skip link jumps to `<main>`. **Accent element:** the SideNav’s active item; AppShell has none of its own.',
      },
    },
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A purchasing screen: grouped navigation with a count, search, the user menu with a role switcher, KPIs, and row actions. Switch roles to see items disabled. */
export const InternalTool: Story = { render: () => <AppDemo /> };

/** The same screen with a search that found nothing. */
export const NoResults: Story = { render: () => <AppDemo empty /> };

/** On a phone: the navigation slides in from the menu button. */
export const Phone: Story = {
  render: () => <AppDemo />,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
