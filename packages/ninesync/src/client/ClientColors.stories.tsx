import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Status, Tag } from '@rnine/core';
import { ClientTheme } from './ClientTheme';
import { syncColors } from './syncColors';
import { TextReveal } from '../motion/TextReveal';

type Args = { brand: string; light: string; dark: string };

const LEVEL = { ok: '✓ OK', warning: '! Warning', error: '✕ Error' } as const;

/** The given client colors in both moods, each with its checks. */
function Checks({ brand, light, dark }: Args) {
  const colors = { brand, light: light || undefined, dark: dark || undefined };
  const result = syncColors(colors);
  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))' }}>
      {/* Scoped to these previews (each carries its mood): the toolbar's client color stays on the rest */}
      <ClientTheme colors={colors} scope=".client-preview" />
      {(['light', 'dark'] as const).map((mood) => (
        <div key={mood} data-scheme={mood} className="client-preview" style={{ display: 'grid', gap: 16, alignContent: 'start', padding: 24, borderRadius: 12, background: 'var(--r9-bg)', color: 'var(--r9-fg)' }}>
          <strong>{mood === 'light' ? 'Light' : 'Dark'}</strong>
          <TextReveal as="h2" text="Purchase orders" trigger="hover" />
          <p style={{ margin: 0 }}>A link in the client’s color: <a href="#top">PO-1042</a></p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button>Approve order</Button>
            <Button variant="secondary">Save draft</Button>
            <Tag>Steel plate</Tag>
            <Status tone="warning">Awaiting approval</Status>
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 6 }}>
            {result[mood].checks.map((c) => (
              <li key={c.id}>
                <b>{LEVEL[c.level]}</b> {c.message}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: 'Client colors/ClientTheme',
  component: Checks,
  args: { brand: '#2B4D82', light: '', dark: '#A2C4F6' },
  argTypes: {
    brand: { control: 'color', description: 'The client’s brand color, as given.' },
    light: { control: 'color', description: 'A second color for the Light mood, when the brand color is too light there.' },
    dark: { control: 'color', description: 'A second color for the Dark mood, when the brand color is too dark there.' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'One brand color in; out come the accent roles for both moods, greys tinted toward its hue, the pale mark and the glow (`syncColors`), put on the page by `ClientTheme`. The checks are core’s `clientAccent`: text and button text 4.5:1 (errors), the button fill 3:1, the pale tone on cards, and a hue near the error red or success green (warnings). A client’s color is never changed to pass: when it fails in a mood, ask the client for a second color for that mood (the check suggests one, which stands in until then). The controls change these previews, one per mood; the client color in the toolbar changes every other story. The brand kit has the full builder.',
      },
    },
  },
} satisfies Meta<typeof Checks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'The default colors',
};

export const OrangeAlone: Story = {
  name: 'Orange, without a second color',
  args: { brand: '#F07F13', light: '', dark: '' },
};

export const OrangeWithSecond: Story = {
  name: 'Orange, with a second color for Light',
  args: { brand: '#F07F13', light: '#A3560D', dark: '' },
};
