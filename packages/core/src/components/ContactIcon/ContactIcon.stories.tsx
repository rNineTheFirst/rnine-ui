import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContactIcon } from './ContactIcon';

const meta: Meta<typeof ContactIcon> = {
  title: 'Components/ContactIcon',
  component: ContactIcon,
  parameters: {
    docs: {
      description: {
        component:
          'The icon for a contact line, from its link: mail, phone, a known site’s mark (Simple Icons, CC0; LinkedIn drawn in Lucide’s line style), or a globe for any other site.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ContactIcon>;

const LINKS = [
  'mailto:hello@example.com',
  'tel:+15550100000',
  'https://www.linkedin.com/in/example',
  'https://github.com/example',
  'https://x.com/example',
  'https://dribbble.com/example',
  'https://youtube.com/@example',
  'https://example.com',
];

export const All: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {LINKS.map((href) => (
        <span key={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <ContactIcon href={href} />
          <code>{href}</code>
        </span>
      ))}
    </div>
  ),
};
