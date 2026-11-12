import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from '../Skeleton/Skeleton';
import { Avatar } from './Avatar';

// A small inline image so the story works offline
const PHOTO =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#26262C"/><circle cx="40" cy="31" r="14" fill="#A2A2AD"/><rect x="16" y="50" width="48" height="30" rx="24" fill="#A2A2AD"/></svg>',
  );

const meta = {
  title: 'Components/Avatar and Skeleton',
  component: Avatar,
  args: { name: 'Arnin Mendoza', size: 'md' },
  parameters: {
    docs: {
      description: {
        component:
          '`Avatar` shows a photo, or initials when there is none or it fails to load (round: one of the few round shapes). `Skeleton` holds space while content loads. **Accent element:** the initials tile or photo ring; the skeleton’s sweeping light.',
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};
export const Photo: Story = { args: { src: PHOTO } };
export const BrokenPhoto: Story = { args: { src: '/missing.jpg' } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar {...args} size="sm" />
      <Avatar {...args} size="md" src={PHOTO} />
      <Avatar {...args} size="lg" />
    </div>
  ),
};

export const LoadingCard: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 360 }} aria-busy="true" aria-label="Loading post">
      <Skeleton shape="block" height={140} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Skeleton shape="circle" />
        <Skeleton lines={2} />
      </div>
      <Skeleton lines={3} />
    </div>
  ),
};
