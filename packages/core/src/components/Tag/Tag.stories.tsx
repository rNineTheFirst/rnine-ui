import type { Meta, StoryObj } from '@storybook/react-vite';
import { Status, Tag } from './Tag';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  args: { children: 'React' },
  parameters: {
    docs: {
      description: {
        component:
          '`Tag` labels a topic or technology. **Accent element:** the square bullet. `Status` shows a state with a word and a dot (never color alone); `live` is cyan and pulses.',
      },
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Inverse: Story = { args: { inverse: true, children: 'Featured' } };

export const Statuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
      <Status tone="live">Live</Status>
      <Status tone="success">Deployed</Status>
      <Status tone="warning">Cache cold</Status>
      <Status tone="danger">Build failed</Status>
      <Status tone="idle">Archived</Status>
    </div>
  ),
};
