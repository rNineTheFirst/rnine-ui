import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Menu, type MenuEntry } from './Menu';

function setup(extra: { onEdit?: () => void; onCancel?: () => void; onRole?: (role: string) => void } = {}) {
  const items: MenuEntry[] = [
    { key: 'edit', label: 'Edit', onSelect: extra.onEdit },
    { key: 'print', label: 'Print', href: '#/print' },
    { key: 'archive', label: 'Archive', disabled: true },
    { kind: 'separator', key: 's1' },
    { key: 'cancel', label: 'Cancel order', tone: 'danger', onSelect: extra.onCancel },
  ];
  const user = userEvent.setup();
  render(
    <>
      <Menu trigger={<button type="button">Actions</button>} items={items} />
      <button type="button">After</button>
    </>,
  );
  return { user, trigger: screen.getByRole('button', { name: 'Actions' }) };
}

describe('Menu', () => {
  it('is a menu button that opens on click and focuses the first item', async () => {
    const { user, trigger } = setup();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(trigger);
    const menu = screen.getByRole('menu', { name: 'Actions' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', menu.id);
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    expect(screen.getByRole('menuitem', { name: 'Print' })).toHaveAttribute('href', '#/print');
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('moves with the arrows (wrapping, skipping disabled), Home and End', async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Print' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Cancel order' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: 'Cancel order' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  });

  it('opens on ArrowUp at the last item', async () => {
    const { user, trigger } = setup();
    trigger.focus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Cancel order' })).toHaveFocus();
  });

  it('jumps to an item by its first letter', async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard('c');
    expect(screen.getByRole('menuitem', { name: 'Cancel order' })).toHaveFocus();
  });

  it('runs the picked item, closes and returns focus to the trigger', async () => {
    const onCancel = vi.fn();
    const { user, trigger } = setup({ onCancel });
    await user.click(trigger);
    await user.click(screen.getByRole('menuitem', { name: 'Cancel order' }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('picks with Enter and Space', async () => {
    const onEdit = vi.fn();
    const onCancel = vi.fn();
    const { user, trigger } = setup({ onEdit, onCancel });
    await user.click(trigger);
    await user.keyboard('{Enter}');
    expect(onEdit).toHaveBeenCalledOnce();
    await user.click(trigger);
    await user.keyboard('{End} ');
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('does nothing for a disabled item', async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    const archive = screen.getByRole('menuitem', { name: 'Archive' });
    expect(archive).toHaveAttribute('aria-disabled', 'true');
    await user.click(archive);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes with Escape (back to the trigger), Tab and a press outside', async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    // Tab hands focus back to the trigger without preventing the default, so the
    // browser's Tab moves on from there (user-event's tab() can't show that: it
    // picks the target from the element focused before the keydown)
    const tab = fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
    expect(tab).toBe(true);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes when the trigger is clicked again', async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('has a header and single-choice groups for a role switcher', async () => {
    const onRole = vi.fn();
    const user = userEvent.setup();
    render(
      <Menu
        trigger={<button type="button" aria-label="Account">MR</button>}
        header={<span>Maria Reyes</span>}
        items={[
          {
            kind: 'group',
            key: 'role',
            label: 'Switch role',
            items: ['Clerk', 'Approver', 'Admin'].map((role) => ({ key: role, label: role, selected: role === 'Clerk', onSelect: () => onRole(role) })),
          },
          { kind: 'separator', key: 's' },
          { key: 'out', label: 'Sign out' },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Account' }));
    expect(screen.getByText('Maria Reyes')).toBeInTheDocument();
    expect(screen.getByRole('menu', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Switch role' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'Clerk' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Admin' })).toHaveAttribute('aria-checked', 'false');
    await user.click(screen.getByRole('menuitemradio', { name: 'Admin' }));
    expect(onRole).toHaveBeenCalledWith('Admin');
  });

  it('keeps the trigger’s own onClick and id, and takes a label', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Menu label="Row actions" trigger={<button type="button" id="row-7" onClick={onClick}>⋯</button>} items={[{ key: 'a', label: 'Open' }]} />);
    await user.click(screen.getByRole('button', { name: '⋯' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: '⋯' })).toHaveAttribute('id', 'row-7');
    expect(screen.getByRole('menu', { name: 'Row actions' })).toBeInTheDocument();
  });
});
