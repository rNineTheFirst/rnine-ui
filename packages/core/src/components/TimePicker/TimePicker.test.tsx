import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TimePicker } from './TimePicker';

describe('TimePicker', () => {
  it('offers every step between min and max, the locale’s way', () => {
    render(<TimePicker inline label="Pickup" value="" onChange={() => {}} min="13:00" max="15:00" step={30} locale="en-GB" />);
    const group = screen.getByRole('group', { name: 'Pickup' });
    expect(group.querySelectorAll('button')).toHaveLength(5);
    expect(screen.getByRole('button', { name: '14:30' })).toBeInTheDocument();
  });

  it('writes 12-hour times', () => {
    render(<TimePicker inline label="Pickup" value="14:30" onChange={() => {}} times={['14:30']} hourCycle="h12" locale="en-US" />);
    expect(screen.getByRole('button', { name: /2:30/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('picks a time, not a taken one', () => {
    const onChange = vi.fn();
    render(<TimePicker inline label="Pickup" value="" onChange={onChange} times={['10:00', '10:30']} isTimeDisabled={(t) => t === '10:30'} locale="en-GB" />);
    fireEvent.click(screen.getByRole('button', { name: '10:30, unavailable' }));
    fireEvent.click(screen.getByRole('button', { name: '10:00' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('10:00');
  });

  it('moves with the arrows, one tab stop', () => {
    render(<TimePicker inline label="Pickup" value="10:30" onChange={() => {}} times={['10:00', '10:30', '11:00']} locale="en-GB" />);
    const picked = screen.getByRole('button', { name: '10:30' });
    expect(picked).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('button', { name: '10:00' })).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(screen.getByRole('group'), { key: 'ArrowDown' });
    expect(screen.getByRole('button', { name: '11:00' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('group'), { key: 'Home' });
    expect(screen.getByRole('button', { name: '10:00' })).toHaveFocus();
  });

  it('shows when a time ends', () => {
    render(<TimePicker inline label="Start" value="" onChange={() => {}} times={['10:00']} duration={30} locale="en-GB" />);
    expect(screen.getByRole('button', { name: '10:00 to 10:30' })).toBeInTheDocument();
  });

  it('opens from the field and closes on a pick', () => {
    const onChange = vi.fn();
    render(<TimePicker label="Pickup" value="" onChange={onChange} times={['10:00', '10:30']} locale="en-GB" />);
    fireEvent.click(screen.getByRole('button', { name: 'Pickup Pick a time' }));
    expect(screen.getByRole('button', { name: '10:00' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: '10:30' }));
    expect(onChange).toHaveBeenCalledWith('10:30');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
