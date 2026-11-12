import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from '../Tag/Tag';
import { Text } from '../Text/Text';
import { Card } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  args: { index: 'PRJ_01', interactive: true, children: null },
  parameters: {
    docs: {
      description: {
        component:
          'A card with the library’s corner on its top right (NineOS: one cut corner). **Accent element:** the corner ornament (NineOS: the cut corner, lit). Interactive cards add a cursor spotlight in the signal color and up to 6° of tilt (mouse only; off with reduced motion). Pass `href` + `label` to make the whole card a link.',
      },
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 380 }}><Story /></div>],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const content = (
  <>
    <Text variant="h3">harbor</Text>
    <Text variant="body-sm" tone="muted">Bookings and billing. React 19 and Express, signed in through Keycloak, behind a Cloudflare Tunnel.</Text>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
      <Tag>React</Tag>
      <Tag>Express</Tag>
      <Tag>Docker</Tag>
    </div>
  </>
);

export const Interactive: Story = { args: { children: content } };
export const Static: Story = { args: { children: content, interactive: false } };
export const AsLink: Story = { args: { children: content, href: '#harbor', label: 'harbor project' } };
