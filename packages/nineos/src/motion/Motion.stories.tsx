import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@rnine/core';
import { TextReveal } from './DecryptText';
import { Backdrop } from './DotField';
import { LiveClock } from '@rnine/core/motion';
import { Magnet } from '@rnine/core/motion';
import { Mark } from './Monogram';
import { Terminal } from './Terminal';
import { TiltCard } from '@rnine/core/motion';
import { VelocityStrip } from './VelocityStrip';

const meta = {
  title: 'Motion/Effects',
  parameters: {
    docs: {
      description: {
        component:
          'The NineOS motion layer, imported from `@rnine/nineos/motion` (NineOS’s own effects in the shared roles: TextReveal, Backdrop, Mark, PageEffects). Every effect answers the person using the page or drifts slowly enough to ignore, and every one stops when the system (or `ThemeProvider reducedMotion`) asks for less motion. Content never waits on animation.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReactiveDotField: Story = {
  render: () => (
    <div style={{ position: 'relative', height: 320, background: 'var(--r9-surface)', overflow: 'hidden' }}>
      <Backdrop />
    </div>
  ),
  parameters: { docs: { description: { story: 'Fills its positioned parent. Dots near the pointer grow, push away and turn magenta; idle ripples are cyan; a click sends one.' } } },
};

export const Decrypt: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <TextReveal as="h2" text="Systems that feel alive." trigger="mount" />
      <TextReveal as="p" text="Hover me to decode again" trigger="hover" />
    </div>
  ),
  parameters: { docs: { description: { story: '`trigger`: mount, view (scrolled into view) or hover. Letters decode left to right from magenta terminal symbols in 1s, each on its own rhythm; the real text holds its place, so nothing on the page moves. Screen readers get the final text through `aria-label`.' } } },
};

export const MagnetButton: Story = {
  name: 'Magnet',
  render: () => (
    <div style={{ padding: 48 }}>
      <Magnet>
        <Button>Move toward me</Button>
      </Magnet>
    </div>
  ),
  parameters: { docs: { description: { story: 'Leans up to 9px toward a nearby pointer. Mouse and trackpad only.' } } },
};

export const SpotlightTilt: Story = {
  name: 'Spotlight + tilt',
  render: () => (
    <div style={{ maxWidth: 380 }}>
      <TiltCard index="FX_06">
        <h3 style={{ margin: 0 }}>Spotlight + tilt</h3>
        <p style={{ margin: 0, color: 'var(--r9-fg-muted)' }}>The light follows the pointer and the card leans with it.</p>
      </TiltCard>
    </div>
  ),
};

export const ScrollStrip: Story = {
  name: 'Scroll-speed strip',
  render: () => <VelocityStrip label="Tools" items={['React', 'Node', 'TypeScript', 'Docker', 'Cloudflare', 'Turborepo']} />,
  parameters: { layout: 'fullscreen' },
};

export const MonogramGlitch: Story = {
  name: 'Monogram',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32 }}>
      <Mark size={96} label="Mark" />
      <Mark size={48} animate="mount" />
      <Mark size={24} variant="simplified" animate="none" />
    </div>
  ),
};

export const LiveTerminal: Story = {
  render: () => (
    <Terminal
      label="Build output"
      lines={[
        { text: 'yarn turbo run build', tone: 'cmd' },
        { text: '  • Remote caching enabled', tone: 'dim' },
        { text: 'frontend:build: cache hit, replaying logs', tone: 'dim' },
        { text: '>>> FULL TURBO  2 cached, 2 total, 176ms', tone: 'ok' },
      ]}
    />
  ),
};

export const Status: Story = { name: 'Live clock', render: () => <LiveClock /> };
