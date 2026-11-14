import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { TimePicker } from './TimePicker';

const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  args: { label: 'Pickup time', value: '10:30', onChange: () => {}, locale: 'en-GB', min: '08:00', max: '18:00' },
  parameters: {
    docs: {
      description: {
        component:
          'A time picked from a list: a field that opens one, or (`inline`) the list alone, in one column or a grid. Values are `HH:mm` strings; the list writes them the locale’s way (14:30 or 2:30 PM, or set `hourCycle`). Offer your own `times`, or every `step` minutes from `min` to `max`; `isTimeDisabled` shows a time but keeps it from being picked (taken), and `duration` writes when each one ends. Keyboard: the arrows move between times; the list is one tab stop. **Accent element:** the picked time, and the field’s own.',
      },
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function Live(props: Partial<ComponentProps<typeof TimePicker>>) {
  const [value, setValue] = useState(props.value ?? '');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <TimePicker label="Pickup time" locale="en-GB" min="08:00" max="18:00" {...props} value={value} onChange={setValue} />
      <small>Value: {value ? `"${value}"` : 'empty'}</small>
    </div>
  );
}

const taken = new Set(['09:00', '11:30', '12:00', '15:30']);

export const Field: Story = { render: () => <Live value="10:30" hint="Every half hour, 8:00 to 18:00." /> };
export const Empty: Story = { render: () => <Live /> };
export const Inline: Story = { render: () => <Live inline value="10:30" /> };
export const Grid: Story = { name: 'Inline grid', render: () => <Live inline layout="grid" value="10:30" /> };
export const Taken: Story = { name: 'Taken times', render: () => <Live inline layout="grid" isTimeDisabled={(t) => taken.has(t)} hint="Taken times show, but can’t be picked." /> };
export const Duration: Story = { name: 'With duration (to …)', render: () => <Live inline duration={45} times={['09:00', '10:00', '11:00', '14:00', '15:00']} /> };
export const TwelveHour: Story = { name: '12-hour (en-US)', render: () => <Live inline layout="grid" locale="en-US" value="14:30" /> };
export const Step: Story = { name: 'Every 15 minutes', render: () => <Live step={15} min="09:00" max="12:00" /> };
export const Required: Story = { args: { required: true, value: '' } };
export const WithError: Story = { args: { value: '07:30', error: 'We open at 8:00.' } };
export const Disabled: Story = { args: { disabled: true } };
