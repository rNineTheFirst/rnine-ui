import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy } from 'lucide-react';
import { Button } from '../Button/Button';
import { Tooltip } from './Tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: { content: 'Copies the CSS variable', children: <Button variant="outline" iconStart={<Copy />}>Copy</Button> },
  parameters: {
    docs: {
      description: {
        component:
          'Short supporting text on hover and keyboard focus; Escape hides it. The trigger must be focusable and is described by the tooltip. Never hide essential information here (touch screens can’t hover). **Accent element:** the pointer tick.',
      },
    },
  },
  decorators: [(Story) => <div style={{ padding: '64px 24px 24px' }}><Story /></div>],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {};
export const Bottom: Story = { args: { placement: 'bottom' } };
