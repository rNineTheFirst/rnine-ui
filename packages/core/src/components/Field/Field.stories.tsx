import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select, TextArea, TextField } from './Field';

const meta = {
  title: 'Components/Field',
  component: TextField,
  args: { label: 'Email', placeholder: 'you@example.com', hint: 'Only used to reply to your comment.' },
  parameters: {
    docs: {
      description: {
        component:
          '`TextField`, `TextArea` and `Select` share one frame: label, control, hint, error. The label is required (a placeholder is not a label). **Accent element:** the mark before the label, the text caret and the focus edge.',
      },
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};
export const Required: Story = { args: { required: true } };
export const WithError: Story = { args: { error: 'Enter an email address, like you@example.com.', defaultValue: 'sam@' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'hello@example.com' } };

export const Area: Story = {
  render: () => <TextArea label="Comment" placeholder="Say something useful" hint="Markdown works." />,
};

export const Dropdown: Story = {
  render: () => (
    <Select label="Topic" defaultValue="work">
      <option value="work">Work together</option>
      <option value="question">A question</option>
      <option value="hello">Just saying hello</option>
    </Select>
  ),
};
