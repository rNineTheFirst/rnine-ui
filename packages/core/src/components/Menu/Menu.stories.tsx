import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ChevronDown, Copy, ExternalLink, MoreHorizontal, Pencil, Printer, Trash2 } from 'lucide-react';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import { Menu } from './Menu';

const meta = {
  title: 'Components/Menu',
  component: Menu,
  args: {
    trigger: <Button variant="outline" iconEnd={<ChevronDown size={18} />}>Actions</Button>,
    items: [
      { key: 'edit', label: 'Edit', icon: <Pencil /> },
      { key: 'duplicate', label: 'Duplicate', icon: <Copy /> },
      { key: 'print', label: 'Print', icon: <Printer />, href: '#print' },
      { key: 'archive', label: 'Archive', disabled: true },
      { kind: 'separator', key: 's' },
      { key: 'delete', label: 'Delete', icon: <Trash2 />, tone: 'danger' },
    ],
  },
  parameters: {
    docs: {
      story: { inline: false, iframeHeight: 360 },
      description: {
        component:
          'A menu of actions that opens from a button (the ARIA menu button): arrows, Home/End and a first letter move; Enter or Space picks; Escape closes and returns to the button; Tab closes and moves on. It opens over everything, so a table or panel never clips it, and flips when there’s no room. Groups of `selected` items are single choices (a role switcher); `header` holds what can’t be picked. **Accent element:** the bar on the focused item.',
      },
    },
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Actions: Story = {};

/** Row actions: an icon-only button (named with aria-label), lined up with the button's end. */
export const RowActions: Story = {
  args: {
    align: 'end',
    label: 'Actions for PO-2026-0042',
    trigger: <Button variant="ghost" size="sm" aria-label="Actions for PO-2026-0042" iconStart={<MoreHorizontal size={18} />} />,
    items: [
      { key: 'open', label: 'Open', icon: <ExternalLink /> },
      { key: 'print', label: 'Print', icon: <Printer /> },
      { kind: 'separator', key: 's' },
      { key: 'cancel', label: 'Cancel order', tone: 'danger' },
    ],
  },
  render: (args) => (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Menu {...args} />
    </div>
  ),
};

function UserMenuDemo() {
  const [role, setRole] = useState('Approver');
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
          {
            kind: 'group',
            key: 'role',
            label: 'Switch role',
            items: ['Clerk', 'Approver', 'Admin'].map((r) => ({ key: r, label: r, selected: r === role, onSelect: () => setRole(r) })),
          },
          { kind: 'separator', key: 's' },
          { key: 'out', label: 'Sign out' },
        ]}
      />
    </div>
  );
}

/** The user menu: who's signed in, a single-choice role switcher, sign out. */
export const UserMenu: Story = { render: () => <UserMenuDemo /> };

/** Near the bottom of the screen it opens upwards. */
export const Flips: Story = {
  render: (args) => (
    <div style={{ minHeight: 320, display: 'flex', alignItems: 'flex-end' }}>
      <Menu {...args} />
    </div>
  ),
};

function InModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Open dialog</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Order PO-2026-0042">
        <p>A menu inside a dialog opens above it and stays usable; Escape closes the menu first, then the dialog.</p>
        <Menu
          trigger={<Button variant="outline" iconEnd={<ChevronDown size={18} />}>More</Button>}
          items={[{ key: 'print', label: 'Print' }, { key: 'copy', label: 'Copy link' }]}
        />
      </Modal>
    </>
  );
}

/** Inside a Modal. */
export const InModal: Story = { render: () => <InModalDemo /> };
