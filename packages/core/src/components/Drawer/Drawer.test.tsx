import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('opens as a modal dialog named by its title and described by its description', () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    render(
      <Drawer isOpen onClose={() => {}} title="PL-10-1220" description="MS plate · Plates" footer={<button type="button">Edit</button>}>
        On hand: 42
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog', { name: 'PL-10-1220' });
    expect(showModal).toHaveBeenCalled();
    expect(dialog).toHaveAccessibleDescription('MS plate · Plates');
    expect(screen.getByText('On hand: 42')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    showModal.mockRestore();
  });

  it('opens without the modal when modal={false}', () => {
    const show = vi.spyOn(HTMLDialogElement.prototype, 'show');
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    render(
      <Drawer isOpen onClose={() => {}} title="Details" modal={false}>
        x
      </Drawer>,
    );
    expect(show).toHaveBeenCalled();
    expect(showModal).not.toHaveBeenCalled();
    show.mockRestore();
    showModal.mockRestore();
  });

  it('closes from its close button', async () => {
    const onClose = vi.fn();
    render(
      <Drawer isOpen onClose={onClose} title="Details" closeLabel="Close details">
        x
      </Drawer>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close details' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape: the cancel event when modal, the key when not', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Drawer isOpen onClose={onClose} title="Details">
        x
      </Drawer>,
    );
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(
      <Drawer isOpen onClose={onClose} title="Details" modal={false}>
        x
      </Drawer>,
    );
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('respects closeOnEsc, and closes on a backdrop click only when modal', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Drawer isOpen onClose={onClose} title="Details" closeOnEsc={false}>
        x
      </Drawer>,
    );
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(
      <Drawer isOpen onClose={onClose} title="Details" modal={false}>
        x
      </Drawer>,
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing inside while closed', () => {
    render(
      <Drawer isOpen={false} onClose={() => {}} title="Details">
        secret
      </Drawer>,
    );
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });
});
