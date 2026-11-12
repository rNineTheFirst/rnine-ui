import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from './Toast';

function Trigger() {
  const toast = useToast();
  return (
    <>
      <button type="button" onClick={() => toast.success('Saved')}>save</button>
      <button type="button" onClick={() => toast.error('Couldn’t save: the title is empty.')}>fail</button>
    </>
  );
}

describe('Toast', () => {
  afterEach(() => vi.useRealTimers());

  it('shows a polite status, then dismisses on click', async () => {
    render(<ToastProvider><Trigger /></ToastProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'save' }));
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('announces errors as alerts', async () => {
    render(<ToastProvider><Trigger /></ToastProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'fail' }));
    expect(screen.getByRole('alert')).toHaveTextContent('the title is empty');
  });

  it('goes away on its own', () => {
    vi.useFakeTimers();
    render(<ToastProvider><Trigger /></ToastProvider>);
    act(() => screen.getByRole('button', { name: 'save' }).click());
    expect(screen.getByText('Saved')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(5100));
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('explains when used outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
