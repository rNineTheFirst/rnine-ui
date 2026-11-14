import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { NumberField } from './NumberField';

const meta = {
  title: 'Components/NumberField',
  component: NumberField,
  args: { label: 'Quantity', value: 12, onChange: () => {} },
  parameters: {
    docs: {
      description: {
        component:
          'A number input for quantities and prices (a spinbutton): a currency symbol or a unit inside the field, grouping and fixed decimals once you leave it, min and max held, arrows step it (PageUp/PageDown by ten, Home/End to min/max), optional − and + buttons. It reports numbers as they’re typed, so totals update live. **Accent element:** the field’s own (the mark before the label, the caret, the focus edge).',
      },
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

function Live(props: Partial<ComponentProps<typeof NumberField>>) {
  const [value, setValue] = useState<number | null>(props.value ?? null);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <NumberField label="Quantity" {...props} value={value} onChange={setValue} />
      <small>Value: {value === null ? 'null' : value}</small>
    </div>
  );
}

export const Quantity: Story = { render: () => <Live value={24} min={0} fractionDigits={0} unit="pcs" /> };
export const Price: Story = { render: () => <Live label="Unit price" value={12450} min={0} currency="PHP" hint="Last paid: ₱12,300.00 (PO-2026-0031)" /> };
export const Weight: Story = { render: () => <Live label="Weight" value={2.5} min={0} step={0.25} fractionDigits={2} unit="kg" /> };
export const Stepper: Story = { render: () => <Live label="Copies" value={1} min={1} max={10} fractionDigits={0} stepper /> };
export const Required: Story = { args: { required: true, value: null } };
export const WithError: Story = { args: { label: 'Received', value: 60, unit: 'pcs', error: 'More than the 50 still due on this PO.' } };
export const Disabled: Story = { args: { disabled: true, unit: 'pcs' } };
export const ReadOnly: Story = { args: { label: 'On hand', readOnly: true, value: 1840, unit: 'pcs' } };
