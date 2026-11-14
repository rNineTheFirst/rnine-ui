import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DateTimePicker, type DateTimePickerProps } from './DateTimePicker';

const TODAY = '2026-11-14';
const OPEN: Record<string, string[]> = {
  '2026-11-16': ['09:00', '10:00'],
  '2026-11-18': ['14:00', '14:30', '15:00'],
};
const byDay = (d: string) => OPEN[d] ?? [];
const day = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name.replace(' ', ',? ')}$`) });

function Booking(props: Partial<DateTimePickerProps> & { onPick?: (v: string) => void }) {
  const [value, setValue] = useState(props.value ?? '');
  return (
    <DateTimePicker
      inline
      label="Time"
      locale="en-GB"
      weekStart={1}
      today={TODAY}
      times={byDay}
      {...props}
      value={value}
      onChange={(v) => {
        setValue(v);
        props.onPick?.(v);
      }}
    />
  );
}

describe('DateTimePicker', () => {
  it('opens on the first day with times and closes the days without', () => {
    render(<Booking />);
    expect(screen.getByText('Mon 16 Nov')).toBeInTheDocument();
    expect(screen.getByText('2 open')).toBeInTheDocument();
    expect(day('Tuesday 17 November 2026, unavailable')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('group', { name: /^Times on Monday,? 16 November$/ })).toBeInTheDocument();
  });

  it('gives the day and time together', () => {
    const onPick = vi.fn();
    render(<Booking onPick={onPick} />);
    fireEvent.click(day('Wednesday 18 November 2026'));
    fireEvent.click(screen.getByRole('button', { name: '14:30' }));
    expect(onPick).toHaveBeenLastCalledWith('2026-11-18T14:30');
    expect(screen.getByRole('button', { name: '14:30' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('clears the time when another day is picked', () => {
    const onPick = vi.fn();
    render(<Booking value="2026-11-18T14:30" onPick={onPick} />);
    expect(screen.getByText('Wed 18 Nov')).toBeInTheDocument();
    fireEvent.click(day('Monday 16 November 2026'));
    expect(onPick).toHaveBeenLastCalledWith('');
    expect(screen.getByText('Mon 16 Nov')).toBeInTheDocument();
  });

  it('says so when no day has times', () => {
    render(<Booking times={() => []} max="2026-11-30" />);
    expect(screen.getByText('No days to pick from.')).toBeInTheDocument();
  });

  it('opens from the field and closes once a time is picked', () => {
    const onChange = vi.fn();
    render(<DateTimePicker label="Remind me" value="" onChange={onChange} today={TODAY} locale="en-GB" weekStart={1} times={['09:00', '14:30']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remind me Pick a date and time' }));
    fireEvent.click(day('Wednesday 18 November 2026'));
    fireEvent.click(screen.getByRole('button', { name: '14:30' }));
    expect(onChange).toHaveBeenLastCalledWith('2026-11-18T14:30');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
