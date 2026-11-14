import { useRef, useState } from 'react';
import { Boxes, ClipboardList, LayoutDashboard, Search, Settings, Truck } from 'lucide-react';
import { AppShell, Avatar, Breadcrumbs, Button, Mark, StatTile, Status, Table, TextField, ToastProvider, useToast, type Column } from '@rnine/core';
import { PageHeader } from '../components/PageHeader/PageHeader';
import { SideNav } from '../components/SideNav/SideNav';
import { Tabs } from '../components/Tabs/Tabs';
import { LiveDot } from '../components/LiveDot/LiveDot';
import { Cascade } from '../motion/Cascade';
import { CountUp } from '../motion/CountUp';
import { pop, wash } from '../motion/wash';
import styles from './Materials.module.scss';

type Material = { sku: string; name: string; unit: string; onHand: number; reorderAt: number; unitCost: number };

const START: Material[] = [
  { sku: 'PL-0610', name: 'Steel plate, 6 mm', unit: 'sheet', onHand: 42, reorderAt: 30, unitCost: 4850 },
  { sku: 'AN-5050', name: 'Angle bar, 50 × 50 × 5', unit: 'length', onHand: 18, reorderAt: 40, unitCost: 1320 },
  { sku: 'RB-1612', name: 'Rebar, 16 mm × 12 m', unit: 'length', onHand: 260, reorderAt: 150, unitCost: 610 },
  { sku: 'SQ-4040', name: 'Square tube, 40 × 40 × 2', unit: 'length', onHand: 9, reorderAt: 25, unitCost: 980 },
  { sku: 'WR-0332', name: 'Welding rod E6013, 3.2 mm', unit: 'box', onHand: 64, reorderAt: 20, unitCost: 1450 },
  { sku: 'GI-2608', name: 'GI sheet, gauge 26 × 8 ft', unit: 'sheet', onHand: 120, reorderAt: 80, unitCost: 540 },
];

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });
const count = new Intl.NumberFormat('en-PH');

const NAV = [
  {
    key: 'main',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
      { key: 'materials', label: 'Materials', icon: <Boxes /> },
      { key: 'orders', label: 'Purchase orders', icon: <ClipboardList />, badge: 3 },
      { key: 'suppliers', label: 'Suppliers', icon: <Truck /> },
    ],
  },
  { key: 'admin', label: 'Admin', items: [{ key: 'settings', label: 'Settings', icon: <Settings /> }] },
];

const below = (m: Material) => m.onHand < m.reorderAt;

function Screen({ title }: { title: string }) {
  const toast = useToast();
  const [rows, setRows] = useState(START);
  const [page, setPage] = useState('materials');
  const badge = useRef<HTMLSpanElement>(null);

  const receive = (sku: string) => {
    setRows((old) => old.map((m) => (m.sku === sku ? { ...m, onHand: m.onHand + m.reorderAt } : m)));
    const m = rows.find((r) => r.sku === sku)!;
    toast.success(`Received ${m.reorderAt} × ${m.name}.`);
    // After React draws the new count: wash the row, pop the count
    requestAnimationFrame(() => {
      wash(document.getElementById(`material-${sku}`)?.closest('tr'));
      pop(badge.current);
    });
  };

  const value = rows.reduce((sum, m) => sum + m.onHand * m.unitCost, 0);
  const low = rows.filter(below);

  const columns: Column<Material>[] = [
    { key: 'sku', header: 'SKU', render: (m) => <span id={`material-${m.sku}`} className={styles.code}>{m.sku}</span>, footer: 'Total' },
    { key: 'name', header: 'Material', sortable: true },
    {
      key: 'onHand',
      header: 'On hand',
      numeric: true,
      sortable: true,
      render: (m) => <span className={below(m) ? styles.below : undefined}>{count.format(m.onHand)} {m.unit}</span>,
    },
    { key: 'reorderAt', header: 'Reorder at', numeric: true },
    { key: 'value', header: 'Value', numeric: true, sortValue: (m) => m.onHand * m.unitCost, render: (m) => peso.format(m.onHand * m.unitCost), footer: (all) => peso.format(all.reduce((s, m) => s + m.onHand * m.unitCost, 0)) },
    {
      key: 'actions',
      header: 'Stock',
      render: (m) => (below(m) ? <Button size="sm" variant="secondary" onClick={() => receive(m.sku)}>Receive</Button> : <Status tone="success">Stocked</Status>),
    },
  ];

  const table = (data: Material[], caption: string) => (
    <Table data={data} columns={columns} keyExtractor={(m) => m.sku} caption={caption} hideCaption defaultSort={{ key: 'name', direction: 'asc' }} />
  );

  return (
    <AppShell
      brand={<span className={styles.brand}><Mark size={28} /> {title}</span>}
      nav={<SideNav groups={NAV} activeKey={page} onSelect={setPage} footer={<span className={styles.footer}><span>Sample data</span><LiveDot>Synced just now</LiveDot></span>} />}
      header={<div className={styles.search}><TextField label="Search materials" hideLabel placeholder="Search materials" type="search" /></div>}
      actions={<Avatar name="Ana Reyes" size="sm" />}
    >
      <Cascade className={styles.page}>
        <PageHeader
          breadcrumbs={<Breadcrumbs items={[{ label: 'Inventory', href: '#' }, { label: 'Materials' }]} />}
          title="Raw materials"
          meta={<LiveDot>Live</LiveDot>}
          description="Stock on hand across the yard. Receive what's below its reorder point."
          actions={<Button iconStart={<Search size={18} />} variant="ghost">Find a supplier</Button>}
        />
        <div className={styles.tiles}>
          <StatTile label="Stock value" value={<CountUp value={value} format={peso} />} hint="At last cost" />
          <StatTile label="Below reorder point" value={<span ref={badge} style={{ display: 'inline-block' }}><CountUp value={low.length} /></span>} tone={low.length ? 'warning' : 'default'} hint={low.length ? 'Receive or order them' : 'All stocked'} />
          <StatTile label="Materials" value={<CountUp value={rows.length} />} change={{ value: '+1', direction: 'up', tone: 'neutral' }} hint="vs last month" />
        </div>
        <Tabs
          label="Materials"
          defaultValue="all"
          items={[
            { id: 'all', label: 'All', content: table(rows, 'All materials') },
            { id: 'low', label: `Below reorder (${low.length})`, content: table(low, 'Materials below their reorder point') },
          ]}
        />
      </Cascade>
    </AppShell>
  );
}

/**
 * A sample internal tool built with NineSync: a materials screen for a steel
 * supplier, in the client's colors (whatever ClientTheme is above it). Sample
 * data; Receive washes the row, ticks the counts and raises a toast.
 */
export function Materials({ title = 'Aperture Steel' }: { title?: string }) {
  return (
    <ToastProvider>
      <Screen title={title} />
    </ToastProvider>
  );
}
