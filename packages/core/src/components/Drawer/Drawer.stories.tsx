import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Status } from '../Tag/Tag';
import { Table, type Column } from '../Table/Table';
import { Drawer } from './Drawer';

type Material = { id: string; name: string; category: string; onHand: number; reorderAt: number; price: number };

const MATERIALS: Material[] = [
  { id: 'PL-10-1220', name: 'MS plate 10mm, 4×8 ft', category: 'Plates', onHand: 42, reorderAt: 20, price: 12450 },
  { id: 'AB-50-6', name: 'Angle bar 50×50×5mm, 6m', category: 'Angle bars', onHand: 8, reorderAt: 30, price: 1180 },
  { id: 'GI-50-6', name: 'GI pipe 2 in, sch 40, 6m', category: 'Pipes', onHand: 65, reorderAt: 25, price: 2240 },
  { id: 'HB-M12-50', name: 'Hex bolt M12×50, zinc', category: 'Fasteners', onHand: 1840, reorderAt: 500, price: 9.5 },
];

const peso = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'PHP' });

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  args: { isOpen: false, onClose: () => {}, title: 'PL-10-1220', children: null },
  parameters: {
    docs: {
      story: { inline: false, iframeHeight: 520 },
      description: {
        component:
          'A panel that slides in from the side with a record’s details beside its list, on the native `<dialog>` element: focus moves in, Escape closes it, focus goes back on close. Modal by default (the page is dimmed and inert, like `Modal`); `modal={false}` keeps the page usable next to it, so picking another row swaps the record. Full width below the sm breakpoint. **Accent element:** the mark after the title.',
      },
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

function Details({ m }: { m: Material }) {
  const low = m.onHand < m.reorderAt;
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 24px', margin: 0 }}>
      <dt>On hand</dt>
      <dd style={{ margin: 0 }}>
        {m.onHand.toLocaleString()} {low && <Status tone="danger">Below reorder point</Status>}
      </dd>
      <dt>Reorder at</dt>
      <dd style={{ margin: 0 }}>{m.reorderAt.toLocaleString()}</dd>
      <dt>Last price</dt>
      <dd style={{ margin: 0 }}>{peso(m.price)}</dd>
    </dl>
  );
}

const COLUMNS: Column<Material>[] = [
  { key: 'id', header: 'Code', sortable: true },
  { key: 'name', header: 'Material' },
  { key: 'onHand', header: 'On hand', numeric: true, sortable: true, render: (m) => m.onHand.toLocaleString() },
];

function ListWithDrawer({ modal }: { modal: boolean }) {
  const [open, setOpen] = useState<Material | null>(null);
  return (
    <>
      <Table data={MATERIALS} columns={COLUMNS} keyExtractor={(m) => m.id} onRowClick={setOpen} caption="Materials" hideCaption />
      <Drawer
        isOpen={!!open}
        onClose={() => setOpen(null)}
        modal={modal}
        title={open?.id}
        description={open && `${open.name} · ${open.category}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(null)}>Close</Button>
            <Button>Create PO</Button>
          </>
        }
      >
        {open && <Details m={open} />}
      </Drawer>
    </>
  );
}

/** Modal (the default): the list behind is dimmed and can't be used until the drawer closes. */
export const Modal: Story = { render: () => <ListWithDrawer modal /> };

/** Beside the list: the page stays usable, so clicking another row swaps the record. */
export const BesideTheList: Story = { render: () => <ListWithDrawer modal={false} /> };

function Sized({ size, side }: { size: 'sm' | 'md' | 'lg'; side: 'start' | 'end' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Open {size} from the {side}</Button>
      <Drawer isOpen={open} onClose={() => setOpen(false)} size={size} side={side} title="Filters">
        <p>Drawer content.</p>
      </Drawer>
    </>
  );
}
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Sized size="sm" side="end" />
      <Sized size="md" side="end" />
      <Sized size="lg" side="end" />
      <Sized size="md" side="start" />
    </div>
  ),
};
