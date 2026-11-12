import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs } from './Breadcrumbs';

const meta = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Blog', href: '#blog' },
      { label: 'The build cache went live' },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Where the current page sits. The last item is the current page (`aria-current="page"`, no link). Use `renderLink` for router links. **Accent element:** the `/` separators.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
