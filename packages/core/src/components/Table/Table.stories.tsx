import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Status } from '../Tag/Tag';
import { Pagination } from './Pagination';
import { Table, type Column } from './Table';

type Post = { id: number; title: string; status: 'Published' | 'Draft'; views: number; updated: string };

const POSTS: Post[] = [
  { id: 1, title: 'The build cache went live', status: 'Published', views: 412, updated: '2026-11-07' },
  { id: 2, title: 'Self-hosting behind a Cloudflare Tunnel', status: 'Published', views: 1290, updated: '2026-11-02' },
  { id: 3, title: 'NineOS: designing two moods', status: 'Draft', views: 0, updated: '2026-11-07' },
  { id: 4, title: 'Keycloak for a one-person site', status: 'Published', views: 876, updated: '2026-10-21' },
  { id: 5, title: 'Turborepo on Yarn 1', status: 'Draft', views: 0, updated: '2026-10-30' },
];

const COLUMNS: Column<Post>[] = [
  { key: 'title', header: 'Title', sortable: true },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (p) => <Status tone={p.status === 'Published' ? 'success' : 'idle'}>{p.status}</Status>,
  },
  { key: 'views', header: 'Views', sortable: true, align: 'end', render: (p) => p.views.toLocaleString() },
  { key: 'updated', header: 'Updated', sortable: true, align: 'end' },
];

const meta = {
  title: 'Components/Table',
  component: Table<Post>,
  args: { data: POSTS, columns: COLUMNS, keyExtractor: (p: Post) => p.id, caption: 'Blog posts' },
  parameters: {
    docs: {
      description: {
        component:
          'Data table: sortable columns (`aria-sort`), row selection, clickable rows (Tab + Enter), loading and empty states; wide tables scroll inside their own box. `numeric` columns line up at the end, column `footer`s make a totals row, and `maxHeight` scrolls the rows inside the table with the header and totals stuck. `Pagination` pages through long lists. **Accent element:** the active sort arrow, selected rows’ edge and checkboxes, the current page.',
      },
    },
  },
} satisfies Meta<typeof Table<Post>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sortable: Story = { args: { defaultSort: { key: 'updated', direction: 'desc' } } };

function SelectableDemo() {
  const [selected, setSelected] = useState<(string | number)[]>([2]);
  return (
    <Table
      data={POSTS}
      columns={COLUMNS}
      keyExtractor={(p) => p.id}
      caption={`${selected.length} selected`}
      selectable
      selectedRows={selected}
      onSelectionChange={setSelected}
      rowLabel={(p) => `Select “${p.title}”`}
    />
  );
}
export const Selectable: Story = { render: () => <SelectableDemo /> };

export const ClickableRows: Story = { args: { onRowClick: () => {} } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [], emptyMessage: 'No posts yet. The first one lands with the redesign.' } };

function PaginationDemo() {
  const [page, setPage] = useState(3);
  const [per, setPer] = useState(20);
  return (
    <Pagination
      currentPage={page}
      totalPages={Math.ceil(132 / per)}
      totalItems={132}
      itemsPerPage={per}
      onPageChange={setPage}
      onItemsPerPageChange={(n) => {
        setPer(n);
        setPage(1);
      }}
      showItemsPerPageSelector
    />
  );
}
type Line = { id: number; part: string; description: string; qty: number; unit: string; price: number };
const LINES: Line[] = [
  { id: 1, part: 'PL-10-1220', description: 'MS plate 10mm, 4×8 ft', qty: 12, unit: 'pcs', price: 12450 },
  { id: 2, part: 'AB-50-6', description: 'Angle bar 50×50×5mm, 6m', qty: 40, unit: 'pcs', price: 1180 },
  { id: 3, part: 'HB-M12-50', description: 'Hex bolt M12×50, zinc', qty: 500, unit: 'pcs', price: 9.5 },
  { id: 4, part: 'WR-E6013-25', description: 'Welding rod E6013 2.5mm', qty: 6, unit: 'box', price: 1650 },
];
const peso = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'PHP' });
const LINE_COLUMNS: Column<Line>[] = [
  { key: 'part', header: 'Part', sortable: true, footer: 'Total' },
  { key: 'description', header: 'Description' },
  { key: 'qty', header: 'Qty', numeric: true, sortable: true, render: (l) => `${l.qty.toLocaleString()} ${l.unit}` },
  { key: 'price', header: 'Unit price', numeric: true, sortable: true, render: (l) => peso(l.price) },
  {
    key: 'amount',
    header: 'Amount',
    numeric: true,
    sortable: true,
    sortValue: (l) => l.qty * l.price,
    render: (l) => peso(l.qty * l.price),
    footer: (rows) => peso(rows.reduce((sum, l) => sum + l.qty * l.price, 0)),
  },
];

/** `numeric` columns line up at the end (the sort arrow goes first); `footer` adds a totals row. */
export const NumbersAndTotals: StoryObj<typeof Table<Line>> = {
  render: () => <Table data={LINES} columns={LINE_COLUMNS} keyExtractor={(l) => l.id} caption="PO-2026-0042 lines" />,
};

const MANY_LINES: Line[] = Array.from({ length: 40 }, (_, i) => ({ ...LINES[i % LINES.length], id: i + 1, qty: (i % 7) * 5 + 1 }));

/** `maxHeight`: the rows scroll inside the table; the header and the totals stay put. */
export const ScrollingRows: StoryObj<typeof Table<Line>> = {
  render: () => <Table data={MANY_LINES} columns={LINE_COLUMNS} keyExtractor={(l) => l.id} caption="Long order" maxHeight="22rem" compact />,
};

export const Paging: Story = { name: 'Pagination', render: () => <PaginationDemo /> };
