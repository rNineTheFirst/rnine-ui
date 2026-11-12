import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from './Progress';

const meta = {
  title: 'Components/Progress',
  component: Progress,
  args: { label: 'Uploading build', value: 68 },
  parameters: {
    docs: {
      description: {
        component:
          'A progress bar with a visible label. Leave out `value` when the duration is unknown. **Accent element:** the fill.',
      },
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Known: Story = {};
export const Steps: Story = { args: { label: 'Deploying', value: 3, max: 5, valueText: '3 of 5 steps' } };
export const Indeterminate: Story = { args: { label: 'Waiting for the tunnel', value: undefined } };
