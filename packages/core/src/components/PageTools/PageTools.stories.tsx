import type { Meta, StoryObj } from '@storybook/react-vite';
import { BackToTop, SkipLink } from './PageTools';

const meta = {
  title: 'Components/Page tools',
  component: SkipLink,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '`SkipLink` is the first thing in the page: hidden until a keyboard user presses Tab, then jumps past the navigation to `#main`. `BackToTop` floats in after scrolling down. **Accent element:** their fills.',
      },
    },
  },
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Skip: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <SkipLink />
      <p style={{ color: 'var(--r9-fg-muted)' }}>Click here, then press Tab: the skip link appears at the top left.</p>
      <main id="main" />
    </div>
  ),
};

export const BackToTopButton: Story = {
  name: 'Back to top',
  render: () => (
    <div style={{ padding: 24, height: 2400 }}>
      <p style={{ color: 'var(--r9-fg-muted)' }}>Scroll down: the button appears after 600px.</p>
      <BackToTop />
    </div>
  ),
  parameters: { docs: { story: { inline: false, iframeHeight: 400 } } },
};
