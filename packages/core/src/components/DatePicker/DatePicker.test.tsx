import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { addMonths, monthWeeks, weekStartOf } from '../../utils/dates';
import { Calendar } from './Calendar';
import { DatePicker } from './DatePicker';

const TODAY = '2026-11-14';
// Long dates read "Wednesday 18 November 2026" or, in newer ICU, with a comma after the weekday
const day = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name.replace(' ', ',? ')}$`) });

describe('dates', () => {
  it('lays out a month in weeks from the week start', () => {
    const weeks = monthWeeks('2026-11-01', 1);
    expect(weeks).toHaveLength(6);
    expect(weeks[0][0]).toBe('2026-10-26');
    expect(weeks[0][6]).toBe('2026-11-01');
    expect(monthWeeks('2026-11-01', 0)).toHaveLength(5);
  });

  it('keeps the day inside a shorter month', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
  });

  it('starts the week on Monday by default', () => {
    expect([0, 1, 6]).toContain(weekStartOf('en-GB'));
  });
});

describe('Calendar', () => {
  it('shows the month and picks an open day', () => {
    const onSelect = vi.fn();
    render(<Calendar value={null} onSelect={onSelect} today={TODAY} locale="en-GB" weekStart={1} />);
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    fireEvent.click(day('Wednesday 18 November 2026'));
    expect(onSelect).toHaveBeenCalledWith('2026-11-18');
  });

  it('marks today and the picked day', () => {
    render(<Calendar value="2026-11-18" onSelect={() => {}} today={TODAY} locale="en-GB" weekStart={1} />);
    expect(day('Saturday 14 November 2026')).toHaveAttribute('aria-current', 'date');
    expect(day('Wednesday 18 November 2026').closest('td')).toHaveAttribute('aria-selected', 'true');
    expect(day('Wednesday 18 November 2026')).toHaveAttribute('tabindex', '0');
  });

  it('reads closed days as unavailable and does not pick them', () => {
    const onSelect = vi.fn();
    render(<Calendar value={null} onSelect={onSelect} today={TODAY} min={TODAY} locale="en-GB" weekStart={1} isDateDisabled={(d) => d === '2026-11-20'} />);
    const closed = day('Friday 20 November 2026, unavailable');
    expect(closed).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(closed);
    fireEvent.click(day('Tuesday 10 November 2026, unavailable'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('moves by day, week and month with the keyboard', () => {
    render(<Calendar value="2026-11-18" onSelect={() => {}} today={TODAY} locale="en-GB" weekStart={1} />);
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(day('Thursday 19 November 2026')).toHaveFocus();
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    expect(day('Thursday 26 November 2026')).toHaveFocus();
    fireEvent.keyDown(grid, { key: 'End' });
    expect(day('Sunday 29 November 2026')).toHaveFocus();
    fireEvent.keyDown(grid, { key: 'Home' });
    expect(day('Monday 23 November 2026')).toHaveFocus();
    fireEvent.keyDown(grid, { key: 'PageDown' });
    expect(screen.getByRole('grid', { name: 'December 2026' })).toBeInTheDocument();
    expect(day('Wednesday 23 December 2026')).toHaveFocus();
  });

  it('stays inside min and max', () => {
    render(<Calendar value={null} onSelect={() => {}} today={TODAY} min="2026-11-10" max="2026-11-30" locale="en-GB" weekStart={1} />);
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'PageDown' });
    expect(day('Monday 30 November 2026')).toHaveFocus();
  });

  it('changes the month with its buttons', () => {
    render(<Calendar value={null} onSelect={() => {}} today={TODAY} locale="en-GB" weekStart={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('grid', { name: 'December 2026' })).toBeInTheDocument();
  });
});

describe('DatePicker', () => {
  it('opens a calendar from the field and closes on a pick', () => {
    const onChange = vi.fn();
    render(<DatePicker label="Delivery date" value="" onChange={onChange} today={TODAY} locale="en-GB" weekStart={1} />);
    const field = screen.getByRole('button', { name: /Delivery date/ });
    expect(field).toHaveAccessibleName('Delivery date Pick a date');
    fireEvent.click(field);
    expect(screen.getByRole('dialog', { name: 'Delivery date' })).toBeInTheDocument();
    expect(day('Saturday 14 November 2026')).toHaveFocus();
    fireEvent.click(day('Wednesday 18 November 2026'));
    expect(onChange).toHaveBeenCalledWith('2026-11-18');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(field).toHaveFocus();
  });

  it('shows the date in words and closes on Escape', () => {
    render(<DatePicker label="Delivery date" value="2026-11-18" onChange={() => {}} today={TODAY} locale="en-GB" />);
    const field = screen.getByRole('button', { name: 'Delivery date 18 Nov 2026' });
    fireEvent.click(field);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(field).toHaveFocus();
  });

  it('can be the calendar alone', () => {
    render(<DatePicker inline label="Day" value="" onChange={() => {}} today={TODAY} locale="en-GB" />);
    expect(screen.getByRole('grid', { name: 'Day, November 2026' })).toBeInTheDocument();
  });
});
