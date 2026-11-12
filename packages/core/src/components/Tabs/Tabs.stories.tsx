import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from '../Text/Text';
import { Tabs } from './Tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: {
    label: 'Portfolio sections',
    items: [
      { id: 'work', label: 'Work', content: <Text tone="muted">Things that are running right now.</Text> },
      { id: 'writing', label: 'Writing', content: <Text tone="muted">Notes on building and self-hosting.</Text> },
      { id: 'lab', label: 'Lab', content: <Text tone="muted">Experiments that might not survive.</Text> },
      { id: 'soon', label: 'Soon', content: null, disabled: true },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Tabs with arrow-key, Home and End navigation; disabled tabs are skipped. **Accent element:** the selected tab’s underline.',
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
