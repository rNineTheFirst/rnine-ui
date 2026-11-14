import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { DateField } from './DateField';

const meta = {
  title: 'Components/DateField',
  component: DateField,
  args: { label: 'Due date', value: '2026-11-20', onChange: () => {} },
  parameters: {
    docs: {
      description: {
        component:
          'A date input: the browser’s own (typed by parts, its calendar, read well by screen readers) in the library’s field frame, its calendar in the page’s mood. Values are `YYYY-MM-DD` strings, so they never shift with time zones. **Accent element:** the field’s own (the mark before the label, the caret, the focus edge).',
      },
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

function Live(props: Partial<ComponentProps<typeof DateField>>) {
  const [value, setValue] = useState(props.value ?? '');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <DateField label="Due date" {...props} value={value} onChange={setValue} />
      <small>Value: {value ? `"${value}"` : 'empty'}</small>
    </div>
  );
}

export const Basic: Story = { render: () => <Live value="2026-11-20" hint="When the supplier delivers." /> };
export const Empty: Story = { render: () => <Live /> };
export const Limited: Story = { render: () => <Live value="2026-11-20" min="2026-11-13" max="2026-12-31" hint="This year only." /> };
export const Required: Story = { args: { required: true, value: '' } };
export const WithError: Story = { args: { value: '2026-10-01', error: 'Due date can’t be before the order date.' } };
export const Disabled: Story = { args: { disabled: true } };
