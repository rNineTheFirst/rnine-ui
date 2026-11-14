import type { Meta, StoryObj } from '@storybook/react-vite';
import { Materials } from './Materials';

const meta = {
  title: 'Example/Materials',
  component: Materials,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An internal tool built with NineSync (a sample: a placeholder steel supplier, mark and stock). Everything moves the way the library does by default: the screen cascades in, the title rises and draws its mark, the counts count up, the side nav and tabs glide their mark, buttons glow and dip, the live dot breathes. Press Receive on a row below its reorder point: the row washes, the count ticks down and a toast says what happened. Pick a client color and Light or Dark in the toolbar.',
      },
    },
  },
} satisfies Meta<typeof Materials>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Screen: Story = {};
