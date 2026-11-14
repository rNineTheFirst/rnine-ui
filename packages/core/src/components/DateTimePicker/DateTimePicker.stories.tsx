import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { DateTimePicker } from './DateTimePicker';

// Every story starts on the same day, so they read the same every time
const TODAY = '2026-11-14';

const meta = {
  title: 'Components/DateTimePicker',
  component: DateTimePicker,
  args: { label: 'Meeting', value: '2026-11-18T10:00', onChange: () => {}, today: TODAY, locale: 'en-GB', minTime: '09:00', maxTime: '17:00' },
  parameters: {
    docs: {
      description: {
        component:
          'A day from a calendar, then a time from that day’s list: `inline` for booking (calendar beside the times when there’s room, stacked when not), or a field that opens both. Values are `YYYY-MM-DDTHH:mm` wall-clock strings with no time zone inside: turn instants into the visitor’s days and times before, and back after. `times` is one list for every day, or a function giving each day its own (a day with none can’t be picked, and the days that have some look open). Picking another day clears the time. The day’s heading enters with the library’s TextReveal. **Accent element:** the picked day and time, and the field’s own.',
      },
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 720 }}><Story /></div>],
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function Live(props: Partial<ComponentProps<typeof DateTimePicker>>) {
  const [value, setValue] = useState(props.value ?? '');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <DateTimePicker label="Meeting" today={TODAY} locale="en-GB" minTime="09:00" maxTime="17:00" {...props} value={value} onChange={setValue} />
      <small>Value: {value ? `"${value}"` : 'empty'}</small>
    </div>
  );
}

// A booking calendar: weekdays only, mornings Monday to Wednesday, afternoons
// Thursday and Friday, a few already taken, Thursday 19 November full.
const MORNINGS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
const AFTERNOONS = ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
const TAKEN = new Set(['2026-11-16T09:30', '2026-11-16T10:00', '2026-11-17T11:00', '2026-11-20T14:00']);
function openTimes(date: string): string[] {
  if (date === '2026-11-19') return [];
  const day = new Date(`${date}T12:00:00`).getDay();
  const list = day >= 1 && day <= 3 ? MORNINGS : day >= 4 && day <= 5 ? AFTERNOONS : [];
  return list.filter((t) => !TAKEN.has(`${date}T${t}`));
}

export const Field: Story = { render: () => <div style={{ maxWidth: 360 }}><Live value="2026-11-18T10:00" hint="Every half hour, 9:00 to 17:00." /></div> };
export const Empty: Story = { render: () => <div style={{ maxWidth: 360 }}><Live /></div> };
export const Inline: Story = { render: () => <Live inline value="2026-11-18T10:00" /> };
export const Availability: Story = {
  name: 'Availability (each day’s own times)',
  render: () => <Live inline value="" times={openTimes} min={TODAY} max="2026-12-31" duration={30} label="Time" />,
};
export const Limited: Story = { name: 'Min and max', render: () => <Live inline value="" min="2026-11-16" max="2026-11-27" step={60} hint="The next two weeks, on the hour." /> };
export const TwelveHour: Story = { name: '12-hour (en-US)', render: () => <Live inline locale="en-US" value="2026-11-18T14:30" /> };
export const Taken: Story = {
  name: 'Taken times',
  render: () => <Live inline value="" step={60} isTimeDisabled={(t) => t === '12:00' || t === '13:00'} hint="Lunch is taken every day." />,
};
export const Required: Story = { render: () => <div style={{ maxWidth: 360 }}><Live required value="" /></div> };
export const WithError: Story = { render: () => <div style={{ maxWidth: 360 }}><Live value="2026-11-14T10:00" error="We don’t meet on Saturdays." /></div> };
export const Disabled: Story = { render: () => <div style={{ maxWidth: 360 }}><Live disabled /></div> };
