import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bookshop } from './Bookshop';

const meta = {
  title: 'Example/Bookshop',
  component: Bookshop,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A fantasy bookshop built with Ninefold (a sample: placeholder shop, books and mark). Everything moves the way the library does by default: the backdrop (leaves by day, fireflies at night), the title growing or gathering, the seal, the lantern trail and the swarm swap, the folded corners lifting, the wax-stamp buttons, the field journal and the moon dial. Drag on empty paper to write. Switch Glint and Gloam in the toolbar.',
      },
    },
  },
} satisfies Meta<typeof Bookshop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shop: Story = {};
