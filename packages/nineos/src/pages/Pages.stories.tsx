import type { Meta, StoryObj } from '@storybook/react-vite';
import * as nineos from '../pages';
import * as plain from '@rnine/core/pages';
import { tokens } from '../../dist/tokens.js';
import chakra600 from '@fontsource/chakra-petch/files/chakra-petch-latin-600-normal.woff2?url';
import chakra700 from '@fontsource/chakra-petch/files/chakra-petch-latin-700-normal.woff2?url';
import hanken from '@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2?url';
import mono from '@fontsource/share-tech-mono/files/share-tech-mono-latin-400-normal.woff2?url';

// A page served somewhere would set fontsUrl and serve pageFonts there. Here
// Storybook serves each file under its own address instead.
const FILES: Record<string, string> = { 'chakra-petch-600': chakra600, 'chakra-petch-700': chakra700, 'hanken-grotesk': hanken, 'share-tech-mono': mono };
const fontFaces = `<style>${nineos.pageFonts
  .map((f) => `@font-face{font-family:"${f.family}";src:url("${FILES[f.id]}") format("woff2");font-weight:${f.weight};font-display:swap}`)
  .join('')}</style>`;

const MARK =
  '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><path d="M8 8h20v6H14v42H8zM36 8h20v48h-6V14H36z"/></svg>';

type Args = { library: 'NineOS' | 'Plain'; mood: 'light' | 'dark'; palette: string };

const pagesOf = (library: Args['library']) => (library === 'NineOS' ? nineos : plain);

/** A page in a frame, in a mood of its own: the page's boot script reads the story's key. */
function Frame({ html, mood, height = 560 }: { html: string; mood: Args['mood']; height?: number }) {
  try {
    localStorage.setItem('story-pages-mood', mood);
  } catch {
    // The page falls back to its Auto rule
  }
  return <iframe title="page" srcDoc={html} style={{ width: '100%', height, border: '1px solid var(--r9-line)', background: 'var(--r9-bg)' }} key={`${mood}${html.length}`} />;
}

const meta = {
  title: 'Patterns/Static pages',
  args: { library: 'NineOS', mood: 'dark', palette: 'magenta' },
  argTypes: {
    library: { control: 'inline-radio', options: ['NineOS', 'Plain'] },
    mood: { control: 'inline-radio', options: ['light', 'dark'] },
    palette: { control: 'inline-radio', options: tokens.palettes.map((p) => p.id) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'For where React doesn’t run: `@rnine/nineos/pages` makes status and error pages, emails and app icons from the tokens, with no React and no DOM (Workers, Node). Every library exports the same names (`@rnine/core/pages` is Plain’s), so a page made with them takes the look of whichever library is imported. Status pages are one HTML document with everything inline but the fonts (`pageFonts`, served at `fontsUrl`), so they work while the rest of a site is down.',
      },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StatusPage: Story = {
  render: ({ library, mood, palette }) => (
    <Frame
      mood={mood}
      html={pagesOf(library).statusPage({
        title: 'Under maintenance',
        label: 'Maintenance',
        code: 'HTTP 503',
        heading: 'Under maintenance',
        paragraphs: ['example.com is getting updates and will be back in a few minutes.'],
        status: { command: 'status example.com', text: 'updating, back in a few minutes' },
        note: 'This page reloads by itself when it’s back.',
        brand: { name: 'Example', mark: MARK },
        palette,
        mood: { storageKey: 'story-pages-mood' },
        head: library === 'NineOS' ? fontFaces : '',
      })}
    />
  ),
  parameters: { docs: { description: { story: '`statusPage()`: a label, a heading, the message and a status line written like a command and its answer (`tone: "error"` for a request that went wrong). `retry` makes a 5xx page reload itself once the address answers again.' } } },
};

export const Email: Story = {
  render: ({ library, palette }) => (
    <Frame
      mood="light"
      height={520}
      html={pagesOf(library).emailLayout({
        eyebrow: '> mail --test · example.com',
        title: 'Email works',
        preheader: 'Sent from example.com.',
        body: '<p style="margin:0;">It left the server and reached you, so the outbox and the DNS records work.</p>',
        action: { label: 'Open the dashboard', href: 'https://example.com' },
        footer: 'Sent from example.com.',
        palette,
      }).replace('<style>', `${library === 'NineOS' ? fontFaces : ''}<style>`)}
    />
  ),
  parameters: { docs: { description: { story: '`emailLayout()`: tables and inline styles, the light mood only (inboxes are light). For the parts you write yourself, `emailTheme()` has every color resolved, the font stacks and the corner radius.' } } },
};

export const AppIcon: Story = {
  render: ({ palette }) => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'end' }}>
      {(['NineOS', 'Plain'] as const).map((library) => (
        <figure key={library} style={{ margin: 0, display: 'grid', gap: 8, justifyItems: 'center' }}>
          <img
            alt={`${library} icon`}
            width={96}
            height={96}
            src={`data:image/svg+xml,${encodeURIComponent(pagesOf(library).markIcon({ mark: { viewBox: '0 0 64 64', paths: '<path d="M8 8h20v6H14v42H8zM36 8h20v48h-6V14H36z"/>' }, palette }))}`}
          />
          <figcaption style={{ font: 'var(--r9-type-caption-font-size) var(--r9-font-mono)' }}>{library}</figcaption>
        </figure>
      ))}
    </div>
  ),
  parameters: { docs: { description: { story: '`markIcon()`: a site’s mark on an accent plate in the library’s corner shape (NineOS cuts two corners, Plain rounds all four). Use it for favicons and app icons.' } } },
};
