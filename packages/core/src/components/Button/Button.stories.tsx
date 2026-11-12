import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Download } from 'lucide-react';
import { Magnet } from '../../motion/Magnet';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'View work', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'outline', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Buttons and button-styled links (pass `href`). **Accent element:** the primary fill, the secondary’s `>` prompt, the outline’s hover edge, the ghost’s hover underline. Use one primary per screen.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { iconEnd: <ArrowRight /> } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Read the blog' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Download CV', iconStart: <Download /> } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'All projects' } };
export const AsLink: Story = { args: { href: '#work', children: 'Jump to work', iconEnd: <ArrowRight /> } };
export const Disabled: Story = { args: { disabled: true, children: 'Publishing…' } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <Magnet>
        <Button iconEnd={<ArrowRight />}>View work</Button>
      </Magnet>
      <Button variant="secondary">Read the blog</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
  parameters: { docs: { description: { story: 'The primary action wrapped in `Magnet` leans toward the pointer.' } } },
};
