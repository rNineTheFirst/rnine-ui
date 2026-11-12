import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Alert } from './Alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  args: {
    tone: 'success',
    title: 'Deployed to staging',
    children: 'Build 7c207bd is live at staging.example.com.',
  },
  argTypes: { tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] } },
  parameters: {
    docs: {
      description: {
        component:
          'A message about something that happened or needs attention: status color on the edge and icon, plus words. **Accent element:** the mark after the title. `danger` uses `role="alert"` (interrupts screen readers); the others are polite.',
      },
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};
export const Info: Story = { args: { tone: 'info', title: 'Cache is cold', children: 'The first build after a dependency change runs in full.' } };
export const Warning: Story = { args: { tone: 'warning', title: 'Certificate renews in 3 days', children: 'Nothing to do: Cloudflare renews it automatically.' } };
export const Danger: Story = {
  args: {
    tone: 'danger',
    title: 'Couldn’t save the post',
    children: 'The title is empty. Add a title and try again.',
    actions: <Button size="sm" variant="outline">Go to title</Button>,
  },
};
export const Dismissible: Story = { args: { onDismiss: () => {} } };
