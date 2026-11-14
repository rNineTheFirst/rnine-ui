import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DateField } from './DateField';

describe('DateField', () => {
  it('is a native date input with its label, value, limits and hint', () => {
    render(<DateField label="Due date" value="2026-11-20" onChange={() => {}} min="2026-11-13" hint="When the supplier delivers" />);
    const input = screen.getByLabelText('Due date');
    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveValue('2026-11-20');
    expect(input).toHaveAttribute('min', '2026-11-13');
    expect(input).toHaveAccessibleDescription('When the supplier delivers');
  });

  it('reports the date as YYYY-MM-DD', () => {
    const onChange = vi.fn();
    render(<DateField label="Due date" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Due date'), { target: { value: '2026-12-01' } });
    expect(onChange).toHaveBeenCalledWith('2026-12-01');
  });

  it('marks an error', () => {
    render(<DateField label="Due date" value="" onChange={() => {}} error="Pick a date" />);
    expect(screen.getByLabelText('Due date')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Pick a date');
  });
});
