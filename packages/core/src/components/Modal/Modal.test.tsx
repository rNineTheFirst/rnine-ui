import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('is a dialog named by its title, with content and footer', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Delete this post?" footer={<button type="button">Delete</button>}>
        This can’t be undone.
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Delete this post?' });
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveTextContent('This can’t be undone.');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('closes from the close button', async () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="Edit">Body</Modal>);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders nothing inside when closed', () => {
    render(<Modal isOpen={false} onClose={() => {}} title="Hidden">Secret</Modal>);
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });
});
