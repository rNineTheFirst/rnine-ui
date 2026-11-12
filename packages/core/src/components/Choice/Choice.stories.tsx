import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox, RadioGroup, Switch } from './Choice';

const meta = {
  title: 'Components/Choice',
  component: Checkbox,
  args: { label: 'Email me new posts' },
  parameters: {
    docs: {
      description: {
        component:
          '`Checkbox`, `Switch` and `RadioGroup`, built on native inputs (keyboard and screen readers work as expected). **Accent element:** the checked box, the on track, the selected dot.',
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CheckboxStory: Story = { name: 'Checkbox', args: { defaultChecked: true, description: 'About once a month.' } };

function MotionSwitch() {
  const [on, setOn] = useState(true);
  return <Switch label={`Motion ${on ? 'on' : 'off'}`} checked={on} onChange={(e) => setOn(e.target.checked)} />;
}

export const SwitchStory: Story = { name: 'Switch', render: () => <MotionSwitch /> };

export const Radios: Story = {
  render: () => (
    <RadioGroup
      legend="Mood"
      defaultValue="auto"
      options={[
        { value: 'auto', label: 'Auto', description: 'Clear by day; Cipher at night with a dark system' },
        { value: 'clear', label: 'Clear', description: 'Light' },
        { value: 'cipher', label: 'Cipher', description: 'Dark' },
      ]}
    />
  ),
};

export const Disabled: Story = { args: { disabled: true, label: 'Not available yet' } };
