import type { Meta, StoryObj } from '@storybook/react-vite';
import { Prose } from './Prose';

const SAMPLE = `
<p>The build cache went live this week. Every CI run used to rebuild <strong>everything</strong>; now unchanged packages come back in under 200ms.</p>
<h2>How it works</h2>
<p>A small server on the home box stores build outputs, keyed by a hash of the inputs. See the <a href="https://turborepo.com/docs">Turborepo docs</a>.</p>
<ul><li>Signed artifacts, so nothing tampered with gets restored</li><li>Reachable over the LAN and through a tunnel</li></ul>
<blockquote><p>Cache hits are the fastest builds.</p></blockquote>
<h3>Setting it up</h3>
<pre><code>TURBO_API=https://turbo.example.com yarn build</code></pre>
<p>Use <code>--summarize</code> to see what was restored.</p>
`;

const meta = {
  title: 'Components/Prose',
  component: Prose,
  args: { html: SAMPLE },
  parameters: {
    docs: {
      description: {
        component:
          'Long-form reading (a blog post body) in NineOS type, at a readable measure. The HTML is sanitized before it renders. **Accent element:** the links and the quote rule.',
      },
    },
  },
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Article: Story = {};
