import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Text } from '../Text/Text';
import { Container, Eyebrow, Section, Stack } from './Layout';

const meta = {
  title: 'Components/Layout',
  component: Section,
  args: {
    id: 'work',
    number: '01',
    eyebrow: 'Selected work',
    title: 'Things that are running right now',
    lede: 'Every project here is live. Move your cursor over a card.',
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '`Section` (eyebrow, decrypting heading, lede, content), `Container` (page column with the gutter), `Stack` (gap from the space scale, never margins) and `Eyebrow`. **Accent element:** the eyebrow’s number block, or its mark when there is no number.',
      },
    },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PageSection: Story = {
  render: (args) => (
    <Section {...args}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <Card index="PRJ_01"><Text variant="h3">harbor</Text><Text variant="body-sm" tone="muted">Bookings and billing.</Text></Card>
        <Card index="PRJ_02"><Text variant="h3">mk-2</Text><Text variant="body-sm" tone="muted">The home server.</Text></Card>
      </div>
    </Section>
  ),
};

export const StackAndContainer: Story = {
  render: () => (
    <Container width="text" style={{ paddingBlock: 48 }}>
      <Stack gap={4}>
        <Eyebrow>Without a number</Eyebrow>
        <Text variant="h2">A readable column</Text>
        <Text tone="muted">Container width “text” keeps running text at 65 characters. Stack spaces its children with a gap from the 4px scale.</Text>
        <Stack direction="row" gap={5} align="center" wrap>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
        </Stack>
      </Stack>
    </Container>
  ),
};
