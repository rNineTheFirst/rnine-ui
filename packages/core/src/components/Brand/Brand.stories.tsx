import type { Meta, StoryObj } from '@storybook/react-vite';
import { Mark } from '../../motion/Mark';
import { MoodToggle, MotionToggle, Wordmark } from './Brand';

const meta = {
  title: 'Brand/Wordmark and mood',
  component: Wordmark,
  args: { size: 'md' },
  parameters: {
    docs: {
      description: {
        component:
          '`Wordmark` sets text wide-tracked in the display font (default: the library’s name). `Mark` is the app’s own mark (`ThemeProvider mark`; a placeholder frame until one is given) with the library’s animation (NineOS: a hover glitch); use `variant="simplified"` at 24px and below. `MoodToggle` switches Auto and the library’s two moods (NineOS: Clear, Cipher) and remembers the choice. **Accent element:** the selected mood’s underline.',
      },
    },
  },
} satisfies Meta<typeof Wordmark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Lockup: Story = {
  render: (args) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
      <Mark size={44} label="Mark" />
      <Wordmark {...args} />
    </span>
  ),
};

export const MoodSwitch: Story = { render: () => <MoodToggle /> };

export const MotionSwitch: Story = { render: () => <MotionToggle /> };
