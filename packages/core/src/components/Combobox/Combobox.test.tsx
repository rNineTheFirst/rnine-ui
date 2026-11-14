import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Combobox, type ComboboxOption } from './Combobox';

const PARTS: ComboboxOption[] = [
  { value: 'pl10', label: 'PL-10-1220', description: 'MS plate 10mm 4×8', keywords: ['plates'] },
  { value: 'pl12', label: 'PL-12-1220', description: 'MS plate 12mm 4×8', keywords: ['plates'] },
  { value: 'ab50', label: 'AB-50-6', description: 'Angle bar 50mm 6m', disabled: true },
  { value: 'hb12', label: 'HB-M12', description: 'Hex bolt M12', keywords: ['fasteners'] },
];

function Picker({ initial = null, onChange }: { initial?: string | null; onChange?: (v: string | null, o: ComboboxOption | null) => void }) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <>
      <Combobox
        label="Part"
        options={PARTS}
        value={value}
        onChange={(v, o) => {
          setValue(v);
          onChange?.(v, o);
        }}
      />
      <button type="button">After</button>
    </>
  );
}

const input = () => screen.getByRole('combobox', { name: 'Part' });

describe('Combobox', () => {
  it('is a combobox named by its label that opens a listbox on ArrowDown', async () => {
    const user = userEvent.setup();
    render(<Picker />);
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    input().focus();
    await user.keyboard('{ArrowDown}');
    const list = screen.getByRole('listbox', { name: 'Part' });
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(input()).toHaveAttribute('aria-controls', list.id);
    expect(screen.getAllByRole('option')).toHaveLength(4);
    expect(input()).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[0].id);
  });

  it('filters by every typed word across label, description and keywords', async () => {
    const user = userEvent.setup();
    render(<Picker />);
    await user.type(input(), 'plate 12mm');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['PL-12-1220MS plate 12mm 4×8']);
    await user.clear(input());
    await user.type(input(), 'fasteners');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.type(input(), 'zzz');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByRole('status')).toHaveTextContent('No matches');
  });

  it('moves with the arrows, skips disabled options, and picks with Enter', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Picker onChange={onChange} />);
    input().focus();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    // pl10 -> pl12 -> (ab50 disabled) -> hb12
    expect(input()).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[3].id);
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('hb12', PARTS[3]);
    expect(input()).toHaveValue('HB-M12');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('picks by click and keeps focus in the input', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Picker onChange={onChange} />);
    await user.click(input());
    await user.click(screen.getByRole('option', { name: /PL-12-1220/ }));
    expect(onChange).toHaveBeenCalledWith('pl12', PARTS[1]);
    expect(input()).toHaveFocus();
    expect(input()).toHaveValue('PL-12-1220');
  });

  it('opens on the picked option, marked selected', async () => {
    const user = userEvent.setup();
    render(<Picker initial="pl12" />);
    expect(input()).toHaveValue('PL-12-1220');
    input().focus();
    await user.keyboard('{ArrowDown}');
    const picked = screen.getByRole('option', { name: /PL-12-1220/ });
    expect(picked).toHaveAttribute('aria-selected', 'true');
    expect(input()).toHaveAttribute('aria-activedescendant', picked.id);
  });

  it('Escape closes and puts the pick back', async () => {
    const user = userEvent.setup();
    render(<Picker initial="pl10" />);
    await user.clear(input());
    await user.type(input(), 'hex');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input()).toHaveValue('PL-10-1220');
  });

  it('on leaving: unmatched text goes back, an exact label picks, an emptied field clears', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Picker initial="pl10" onChange={onChange} />);

    await user.clear(input());
    await user.type(input(), 'nope');
    await user.tab();
    expect(input()).toHaveValue('PL-10-1220');
    expect(onChange).not.toHaveBeenCalled();

    await user.clear(input());
    await user.type(input(), 'hb-m12');
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith('hb12', PARTS[3]);

    await user.clear(input());
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(null, null);
    expect(input()).toHaveValue('');
  });

  it('with filter={false} shows the options as given and reports the query', async () => {
    const onQuery = vi.fn();
    const user = userEvent.setup();
    render(<Combobox label="Supplier" options={PARTS.slice(0, 1)} value={null} onChange={() => {}} filter={false} onQueryChange={onQuery} />);
    await user.type(screen.getByRole('combobox'), 'zz');
    expect(onQuery).toHaveBeenLastCalledWith('zz');
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('shows the loading message while loading', async () => {
    const user = userEvent.setup();
    render(<Combobox label="Supplier" options={PARTS} value={null} onChange={() => {}} loading />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  });

  it('wires the error to the input', () => {
    render(<Combobox label="Part" options={PARTS} value={null} onChange={() => {}} error="Pick a part" />);
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveAccessibleDescription('Pick a part');
  });
});
