import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { DatePicker } from './DatePicker';

// Every story starts on the same day, so they read the same every time
const TODAY = '2026-11-14';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  args: { label: 'Delivery date', value: '2026-11-20', onChange: () => {}, today: TODAY, locale: 'en-GB' },
  parameters: {
    docs: {
      description: {
        component:
          'A date picked from a calendar: a field that opens one, or (`inline`) the calendar alone. Values are `YYYY-MM-DD` strings, so they never shift with time zones. Keyboard: the arrows move a day or a week, Home/End go to the week’s ends, PageUp/PageDown change the month (with Shift, the year); the calendar is one tab stop. The month’s name enters with the library’s TextReveal and a new month with its swap. For typing a date (a birthday, a filter), DateField. **Accent element:** the picked day, and the field’s own.',
      },
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function Live(props: Partial<ComponentProps<typeof DatePicker>>) {
  const [value, setValue] = useState(props.value ?? '');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <DatePicker label="Delivery date" today={TODAY} locale="en-GB" {...props} value={value} onChange={setValue} />
      <small>Value: {value ? `"${value}"` : 'empty'}</small>
    </div>
  );
}

const weekend = (date: string) => {
  const day = new Date(`${date}T12:00:00`).getDay();
  return day === 0 || day === 6;
};

export const Field: Story = { render: () => <Live value="2026-11-20" hint="When the supplier delivers." /> };
export const Empty: Story = { render: () => <Live /> };
export const Inline: Story = { render: () => <Live inline value="2026-11-20" /> };
export const Availability: Story = {
  name: 'Availability (weekdays open)',
  render: () => <Live inline availability min={TODAY} max="2026-12-31" isDateDisabled={weekend} label="Pick a day" />,
};
export const Limited: Story = { name: 'Min and max', render: () => <Live value="2026-11-20" min={TODAY} max="2026-12-31" hint="From today to the end of the year." /> };
export const UsWeek: Story = { name: 'en-US (weeks from Sunday)', render: () => <Live locale="en-US" inline value="2026-11-20" /> };
export const Required: Story = { args: { required: true, value: '' } };
export const WithError: Story = { args: { value: '2026-11-01', error: 'Delivery can’t be before today.' } };
export const Disabled: Story = { args: { disabled: true } };
