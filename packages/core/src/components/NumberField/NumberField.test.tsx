import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NumberField } from './NumberField';

type Extra = Partial<Omit<ComponentProps<typeof NumberField>, 'value' | 'onChange' | 'label'>>;

function Field({ initial = null, onChange, ...props }: Extra & { initial?: number | null; onChange?: (n: number | null) => void }) {
  const [value, setValue] = useState<number | null>(initial);
  return (
    <>
      <NumberField
        label="Quantity"
        locale="en-US"
        value={value}
        onChange={(n) => {
          setValue(n);
          onChange?.(n);
        }}
        {...props}
      />
      <button type="button">After</button>
    </>
  );
}

const input = () => screen.getByRole('spinbutton', { name: 'Quantity' });

describe('NumberField', () => {
  it('is a spinbutton with its value, min and max', () => {
    render(<Field initial={12} min={0} max={100} fractionDigits={0} unit="pcs" />);
    expect(input()).toHaveValue('12');
    expect(input()).toHaveAttribute('aria-valuenow', '12');
    expect(input()).toHaveAttribute('aria-valuemin', '0');
    expect(input()).toHaveAttribute('aria-valuemax', '100');
    expect(input()).toHaveAttribute('aria-valuetext', '12 pcs');
    expect(input()).toHaveAttribute('inputmode', 'numeric');
  });

  it('reports numbers as they are typed and formats on leaving', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Field onChange={onChange} />);
    await user.type(input(), '12450');
    expect(onChange).toHaveBeenLastCalledWith(12450);
    expect(input()).toHaveValue('12450');
    await user.tab();
    expect(input()).toHaveValue('12,450');
  });

  it('formats money with the currency symbol and its decimals', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Field currency="PHP" onChange={onChange} />);
    expect(screen.getByText('₱')).toBeInTheDocument();
    await user.type(input(), '1,234.5');
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(1234.5);
    expect(input()).toHaveValue('1,234.50');
    expect(input()).toHaveAttribute('aria-valuetext', '₱1,234.50');
  });

  it('holds min and max and rounds to fractionDigits on leaving', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Field min={0} max={50} fractionDigits={0} onChange={onChange} />);
    await user.type(input(), '75');
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(50);
    await user.clear(input());
    await user.type(input(), '7.6');
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(8);
  });

  it('puts the last value back when the text is not a number', async () => {
    const user = userEvent.setup();
    render(<Field initial={5} />);
    // Typed over the selection: never empty, never a number
    await user.tripleClick(input());
    await user.keyboard('abc');
    await user.tab();
    expect(input()).toHaveValue('5');
  });

  it('clears to null when emptied', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Field initial={5} onChange={onChange} />);
    await user.clear(input());
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('steps with the arrows and PageUp/PageDown, and goes to min/max with Home/End', async () => {
    const user = userEvent.setup();
    render(<Field initial={5} min={0} max={30} step={2} />);
    input().focus();
    await user.keyboard('{ArrowUp}');
    expect(input()).toHaveValue('7');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(input()).toHaveValue('3');
    await user.keyboard('{PageUp}');
    expect(input()).toHaveValue('23');
    await user.keyboard('{PageUp}');
    expect(input()).toHaveValue('30');
    await user.keyboard('{Home}');
    expect(input()).toHaveValue('0');
    await user.keyboard('{End}');
    expect(input()).toHaveValue('30');
  });

  it('steps decimals without float noise', async () => {
    const user = userEvent.setup();
    render(<Field initial={0.1} step={0.2} />);
    input().focus();
    await user.keyboard('{ArrowUp}');
    expect(input()).toHaveValue('0.3');
  });

  it('has − and + buttons that stop at the limits', async () => {
    const user = userEvent.setup();
    render(<Field initial={1} min={0} max={2} stepper />);
    const less = screen.getByRole('button', { name: 'Decrease' });
    const more = screen.getByRole('button', { name: 'Increase' });
    await user.click(more);
    expect(input()).toHaveValue('2');
    expect(more).toBeDisabled();
    await user.click(less);
    await user.click(less);
    expect(input()).toHaveValue('0');
    expect(less).toBeDisabled();
  });

  it('does not step when read-only', async () => {
    const user = userEvent.setup();
    render(<Field initial={1} readOnly />);
    input().focus();
    await user.keyboard('{ArrowUp}');
    expect(input()).toHaveValue('1');
  });
});
