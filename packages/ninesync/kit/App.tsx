import { useCallback, useRef, useState } from 'react';
import {
  Button,
  Card,
  ClientTheme,
  Container,
  Eyebrow,
  LiveDot,
  Section,
  SideNav,
  Stack,
  StatTile,
  Status,
  Tabs,
  Tag,
  ThemeProvider,
  Wordmark,
  useMood,
  type ClientColors,
} from '@rnine/ninesync';
import { CountUp, Mark, TextReveal, pop, swapIn, swapOut, wash } from '@rnine/ninesync/motion';
import { tokens } from '../dist/tokens.js';
import { ColorRoles, ContrastTable, CopyValue, KitHeader } from '../../core/site/shell';
import type { SiteInfo } from '../../core/site/types';
import { Materials } from '../src/example/Materials';
import { SAMPLE_MARK } from '../src/example/client';
import { Builder } from './Builder';
import { CHAPTERS } from './chapters';
import styles from './App.module.scss';

declare const __VERSION__: string;

type Props = { site: SiteInfo };

const moods = tokens.moods;

/** Story ids in NineSync's Storybook, for the component gallery. */
const STORY = {
  client: 'client-colors-clienttheme--default',
  button: 'components-button--all-variants',
  tabs: 'components-ninesync-only--tabs-story',
  nav: 'components-ninesync-only--side-nav-story',
  live: 'components-ninesync-only--live-dot-story',
  stat: 'components-stattile--row',
  table: 'components-table--numbers-and-totals',
  shell: 'components-appshell--internal-tool',
  reveal: 'motion-effects--draw-the-mark',
  count: 'motion-effects--count-up-story',
  wash: 'motion-effects--wash-and-pop',
  example: 'example-materials--screen',
} as const;

const FONTS = [
  ['DM Sans', 'font-body', 'Everything: headings, running text, UI. Variable, with an optical-size axis, so big headlines draw tighter on their own.', 'https://fontsource.org/fonts/dm-sans'],
  ['DM Mono', 'font-mono', 'Codes (SKUs, order numbers) and figures that must line up.', 'https://fontsource.org/fonts/dm-mono'],
] as const;

const TUNED = [
  ['Title (TextReveal)', 'rises 4px and fades in (260 ms), then its mark draws under the last word (420 ms)'],
  ['Mark glide (Tabs, SideNav)', '260 ms to the new tab or page'],
  ['Screen cascade (PageEffects)', 'blocks rise 8px, 40 ms apart; table rows 18 ms apart'],
  ['Swap (swapIn / swapOut)', 'out 120 ms; in 220 ms, rising 6px'],
  ['CountUp', 'from zero 700 ms when it appears; old to new 420 ms'],
  ['Glow', 'in 160 ms, out 300 ms (Sync UI’s fade)'],
  ['Press', 'buttons dip to 97%'],
  ['Focus ring', 'settles in from 6px out (160 ms)'],
  ['Wash and pop', 'pale wash fades over 1.2 s; a changed count pops to 118% (300 ms)'],
  ['Drawer, toast', 'slides in 24px; a pale timer line runs along the toast'],
  ['Loading', 'a pale sheen across placeholders'],
  ['LiveDot', 'a soft ring every 3.2 s: the only thing that moves on its own'],
] as const;

const VOICE = [
  ['A save', 'Saved. PO-1042 is waiting for approval.', 'Success!! Your changes have been saved successfully.'],
  ['A count', '2 materials below their reorder point', 'Uh-oh! Stock is running low!'],
  ['A button', 'Approve order', 'Submit'],
  ['Nothing yet', 'No orders this week. New ones show here as they come in.', 'Nothing to see here!'],
  ['Something went wrong', 'Couldn’t save PO-1042: the connection dropped. Your changes are still here; try again.', 'Oops! Something went wrong.'],
] as const;

const SWAP = [
  ['Materials', '6 materials, 2 below their reorder point.'],
  ['Suppliers', '14 suppliers, 1 with an overdue delivery.'],
] as const;

const NAV = [
  {
    key: 'main',
    items: [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'materials', label: 'Materials' },
      { key: 'orders', label: 'Purchase orders', badge: 3 },
    ],
  },
];

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 });

/** One Do or Don't example. The verdict is in a word and a symbol, never color alone. */
function Example({ good, title, children }: { good: boolean; title: string; children: React.ReactNode }) {
  return (
    <figure className={styles.example} data-good={good || undefined}>
      <div className={styles.exampleStage}>{children}</div>
      <figcaption>
        <b className={styles.verdict}><span aria-hidden="true">{good ? '✓' : '✕'}</span> {good ? 'Do' : 'Don’t'}</b> {title}
      </figcaption>
    </figure>
  );
}

/** The sample screen, in the builder's colors and the page's mood. */
function Sample({ colors }: { colors: ClientColors | null }) {
  const { scheme } = useMood();
  return (
    <div className={styles.frame}>
      <div className={`${styles.frameScroll} kit-sample`} data-scheme={scheme}>
        {colors && <ClientTheme colors={colors} scope=".kit-sample" />}
        <Materials />
      </div>
    </div>
  );
}

export function App({ site }: Props) {
  const own = site.themes.find((t) => t.id === 'ninesync');
  // The client's mark goes in every Mark; here a sample client's, or NineSync's monogram once it has one
  const mark = own?.monogram ? { full: own.monogram, simplified: own.monogramSimplified ?? undefined } : SAMPLE_MARK;
  const storybook = site.docsUrl ? `${site.docsUrl}ninesync/` : null;
  const story = (id: string) => (storybook ? `${storybook}?path=/story/${id}` : null);
  const [replay, setReplay] = useState(0);
  const [tab, setTab] = useState('open');
  const [page, setPage] = useState('materials');
  const [swapped, setSwapped] = useState(0);
  const [value, setValue] = useState(1240500);
  const [client, setClient] = useState<ClientColors | null>(null);
  const swapRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const onColors = useCallback((c: ClientColors | null) => setClient(c), []);

  const swap = async () => {
    if (swapRef.current) await swapOut(swapRef.current);
    setSwapped((n) => (n + 1) % SWAP.length);
    requestAnimationFrame(() => swapRef.current && swapIn(swapRef.current));
  };

  const receive = () => {
    setValue((v) => v + 48500);
    requestAnimationFrame(() => {
      wash(saveRef.current);
      pop(badgeRef.current);
    });
  };

  const links = [
    ...(storybook ? [{ href: storybook, label: 'Storybook' }] : []),
    { href: '../', label: 'All themes' },
  ];

  const more = (id: keyof typeof STORY) => story(STORY[id]) && <a href={story(STORY[id])!}>Storybook <span aria-hidden="true">↗</span></a>;

  return (
    <ThemeProvider mark={mark}>
      <div className={styles.app}>
        <a className={styles.skip} href="#principles">Skip to the kit</a>
        <KitHeader title="NineSync" chapters={CHAPTERS} links={links} />
        <main id="top">
          <section className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroInner}>
              <div className={styles.heroCopy}>
                <Eyebrow>{own?.package ?? '@rnine/ninesync'} · v{__VERSION__}</Eyebrow>
                <TextReveal as="h1" id="hero-title" className={styles.heroTitle} text="NineSync" trigger="mount" />
                <p className={styles.lede}>
                  A calm design system for internal tools and dashboards, in the client’s own color: inventory, purchasing,
                  back offices. Pale marks under titles and tabs, a soft glow, numbers that line up.
                </p>
                <p className={styles.moodsLine}>
                  <b>{moods.light.label}</b> {moods.light.description} <b>{moods.dark.label}</b> {moods.dark.description}
                </p>
                <div className={styles.actions}>
                  <Button href="#builder">Check a client’s colors</Button>
                  {storybook && <Button variant="secondary" href={storybook}>Open the Storybook</Button>}
                </div>
              </div>
              <div className={styles.heroTiles} data-cascade="">
                <StatTile label="Stock value" value={<CountUp value={1240500} format={peso} />} hint="At last cost" />
                <StatTile label="Below reorder point" value={<CountUp value={2} />} tone="warning" hint="Receive or order them" />
                <div className={styles.heroLive}><LiveDot>Synced just now</LiveDot></div>
              </div>
            </div>
          </section>

          <Section id="principles" number="01" eyebrow="Principles" title="Calm tools people use all day" lede="For the screens a business runs on: stock, orders, approvals, reports. Clear before clever, quiet until something needs attention, and in the client’s own color.">
            <div className={styles.grid3}>
              <Card interactive={false}>
                <h3 className={styles.h3}>The client’s color</h3>
                <p className={styles.muted}>Every app wears its client’s brand color. One color in, every role out, checked for contrast. A color is never changed to pass: when it fails, ask for a second one.</p>
              </Card>
              <Card interactive={false}>
                <h3 className={styles.h3}>Two moods</h3>
                <p className={styles.muted}><b>{moods.light.label}</b> and <b>{moods.dark.label}</b>, following the system by default. Greys lean toward the client’s hue in both.</p>
              </Card>
              <Card interactive={false}>
                <h3 className={styles.h3}>The pale mark</h3>
                <p className={styles.muted}>A pale bar under titles, the selected tab and the current page, thicker as the type grows. It’s decoration: never text, never the only sign of state.</p>
              </Card>
              <Card interactive={false}>
                <h3 className={styles.h3}>Numbers first</h3>
                <p className={styles.muted}>Figures line up, totals sit at the foot, codes are in mono. A dashboard reads at a glance.</p>
              </Card>
              <Card interactive={false}>
                <h3 className={styles.h3}>Soft, not flat</h3>
                <p className={styles.muted}>12px corners, hairline edges, no drop shadows. On hover, the Sync glow: three soft layers, quick in, slow out.</p>
              </Card>
              <Card interactive={false}>
                <h3 className={styles.h3}>Subtle but alive</h3>
                <p className={styles.muted}>Titles draw their mark, screens cascade in, counts count, a save washes what changed. Only the live dot moves on its own, and all of it stops for reduced motion.</p>
              </Card>
            </div>
          </Section>

          <Section id="builder" number="02" eyebrow="Client colors" title="Check a client’s colors" lede={<>Put in the client’s brand color. The builder makes every role for both moods with the same <code>syncColors</code> the app uses, checks each one, and says what to ask for when one fails. The thresholds: text and button text 4.5:1 (errors), the button fill 3:1, the pale tone on cards 1.3:1, and a hue near the error red or success green (warnings).</>}>
            <Builder onColors={onColors} />
          </Section>

          <Section id="color" number="03" eyebrow="Color" title="Greys, one color and its pale tone" lede="These are the default colors, Sync blue with its light blue for Dark. A client’s colors replace the accent roles, the mark and the greys’ tint; the status colors stay. Components use these roles, never raw colors. Tap a name or a value to copy it.">
            <ColorRoles schemes={tokens.schemes} moods={moods} />
          </Section>

          <Section id="type" number="04" eyebrow="Type" title="One family, two cuts" lede="Both self-hosted through Fontsource under the SIL Open Font License (@rnine/ninesync/fonts.css). Headlines are moderate: weight 650, tracked −0.025em. Use the type roles, not raw sizes.">
            <div className={styles.fonts}>
              {FONTS.map(([name, token, use, href]) => (
                <div key={name} className={styles.font}>
                  <span className={styles.specimen} style={{ fontFamily: `var(--r9-${token})` }}>
                    {token === 'font-mono' ? 'PO-1042 · ₱1,240,500' : 'Stock you can see at a glance'}
                  </span>
                  <span className={styles.fontMeta}>
                    <b>{name}</b> <code>--r9-{token}</code> <a href={href}>Fontsource <span aria-hidden="true">↗</span></a>
                  </span>
                  <span className={styles.muted}>{use}</span>
                </div>
              ))}
            </div>
            <div className={styles.roles}>
              {tokens.typeRoles.map((r) => (
                <div key={r.name} className={styles.role}>
                  <code>{r.name}</code>
                  <span style={{ fontFamily: r.fontFamily, fontWeight: r.fontWeight, fontSize: r.fontSize, lineHeight: r.lineHeight, letterSpacing: r.letterSpacing, textTransform: r.name === 'label' || r.name === 'wordmark' ? 'uppercase' : undefined }}>
                    {r.name === 'code' ? 'syncColors({ brand })' : 'Two materials are below their reorder point'}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="shape" number="05" eyebrow="Shape and the mark" title="Soft corners, a pale mark, a glow" lede="Corners round to their size and nothing is cut. Edges are hairlines. The mark thickens with the type; the glow is the only shadow.">
            <div className={styles.grid3}>
              <div className={styles.shape}><div className={styles.cornerSm} /><code>r9.$corner-sm</code><span className={styles.muted}>8px: chips, checkboxes</span></div>
              <div className={styles.shape}><div className={styles.cornerMd} /><code>r9.$corner-md</code><span className={styles.muted}>12px: buttons, fields, menus</span></div>
              <div className={styles.shape}><div className={styles.cornerLg} /><code>r9.$corner-lg</code><span className={styles.muted}>12px: cards, panels, drawers</span></div>
            </div>
            <div className={styles.marks}>
              <span className={styles.markDisplay}>Purchase <span className={styles.mark}>orders</span></span>
              <span className={styles.markH2}>Raw <span className={styles.mark}>materials</span></span>
              <span className={styles.markBody}>A link with its <span className={styles.mark}>mark</span> at body size</span>
              <span className={styles.muted}><code>@include r9.mark-under</code>: about 2px at body size, 9px at 64px. Wraps across lines.</span>
            </div>
            <div className={styles.grid2}>
              <button type="button" className={styles.glowSample}>
                <b>Hover or focus me</b>
                <span className={styles.muted}><code>@include r9.glow-hover</code>: grey layers in {moods.light.label}, the pale tone in {moods.dark.label}.</span>
              </button>
              <div className={styles.shape}>
                <Stack direction="row" gap={3} wrap align="center"><Button>Approve order</Button><Button variant="secondary">Save draft</Button></Stack>
                <span className={styles.muted}>Buttons glow on hover and dip to 97% when pressed. <code>secondary</code> is Sync UI’s outlined button, its border in the pale tone.</span>
              </div>
            </div>
          </Section>

          <Section id="motion" number="06" eyebrow="Motion" title="Subtle, but alive" lede="Motion says what changed and where to look, then gets out of the way. Content never waits on it.">
            <div className={styles.grid2}>
              <div className={styles.stage}>
                <span className={styles.stageLabel}>TextReveal</span>
                <TextReveal key={replay} as="p" className={styles.stageTitle} text="Purchase orders" trigger="mount" />
                <Button size="sm" variant="secondary" onClick={() => setReplay((n) => n + 1)}>Play again</Button>
              </div>
              <div className={styles.stage}>
                <span className={styles.stageLabel}>swapIn · swapOut</span>
                <div ref={swapRef} className={styles.swapPanel}>
                  <h3 className={styles.h3}>{SWAP[swapped][0]}</h3>
                  <p className={styles.muted}>{SWAP[swapped][1]}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => void swap()}>Next page</Button>
              </div>
              <div className={styles.stage}>
                <span className={styles.stageLabel}>CountUp · wash · pop</span>
                <div ref={saveRef} className={styles.savePanel}>
                  <span className={styles.muted}>Stock value</span>
                  <span className={styles.saveValue}><CountUp value={value} format={peso} /></span>
                  <span ref={badgeRef} className={styles.badge}>{Math.round((value - 1240500) / 48500)} received</span>
                </div>
                <Button size="sm" onClick={receive}>Receive a delivery</Button>
              </div>
              <div className={styles.stage}>
                <span className={styles.stageLabel}>Tabs · LiveDot</span>
                <Tabs
                  label="Order status"
                  value={tab}
                  onChange={setTab}
                  items={[
                    { id: 'open', label: 'Open', content: <p className={styles.muted}>7 open orders.</p> },
                    { id: 'received', label: 'Received', content: <p className={styles.muted}>42 this month.</p> },
                    { id: 'late', label: 'Late', content: <p className={styles.muted}>1 overdue delivery.</p> },
                  ]}
                />
                <LiveDot>Synced just now</LiveDot>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.hidden}>The tuned motion values</caption>
                <thead><tr><th scope="col">What</th><th scope="col">The tuned value (the default)</th></tr></thead>
                <tbody>{TUNED.map(([what, v]) => <tr key={what}><th scope="row">{what}</th><td>{v}</td></tr>)}</tbody>
              </table>
            </div>
            <ul className={styles.rules}>
              <li>Content never waits: a title is readable as it rises, a table is usable while its rows cascade in.</li>
              <li>Everything stops for reduced motion (the system setting, the viewer’s Still, or <code>ThemeProvider reducedMotion</code>): titles show with their mark, counts show their number.</li>
              <li>Only <code>LiveDot</code> moves on its own. Effects never take clicks and are hidden from screen readers.</li>
            </ul>
          </Section>

          <Section id="components" number="07" eyebrow="Components" title="What NineSync adds and restyles" lede={<>Every core component is here, in NineSync’s look{storybook ? <> (see them all in the <a href={storybook}>Storybook</a>)</> : null}. These are the ones NineSync has its own version of, or has only for itself.</>}>
            <div className={styles.gallery}>
              <figure className={styles.piece}>
                <div className={styles.pieceStage}><Stack direction="row" gap={3} wrap><Button>Approve order</Button><Button variant="secondary">Save draft</Button><Button variant="ghost">Cancel</Button></Stack></div>
                <figcaption><b>Button</b> Filled in the client’s color for the main action; glows and dips. {more('button')}</figcaption>
              </figure>
              <figure className={styles.piece}>
                <div className={styles.pieceStage}>
                  <div className={styles.navSample}><SideNav label="Sample navigation" groups={NAV} activeKey={page} onSelect={setPage} /></div>
                </div>
                <figcaption><b>SideNav</b> The mark glides to the page you pick. {more('nav')}</figcaption>
              </figure>
              <figure className={styles.piece}>
                <div className={styles.pieceStage}><Stack gap={3}><LiveDot>Synced just now</LiveDot><LiveDot state="idle">Offline</LiveDot></Stack></div>
                <figcaption><b>LiveDot</b> NineSync only: the one thing that moves on its own. {more('live')}</figcaption>
              </figure>
              <figure className={`${styles.piece} ${styles.wide}`}>
                <div className={styles.pieceStage}>
                  <div className={styles.tiles}>
                    <StatTile label="Open orders" value="7" />
                    <StatTile label="Awaiting approval" value="3" tone="warning" />
                    <StatTile label="Received" value="42" change={{ value: '12%', direction: 'up' }} hint="vs last month" />
                  </div>
                </div>
                <figcaption><b>StatTile</b> With <code>CountUp</code> as its value, it counts when it appears. {more('stat')}</figcaption>
              </figure>
              <figure className={styles.piece}>
                <div className={styles.pieceStage}><Stack direction="row" gap={2} wrap><Tag>Steel plate</Tag><Status tone="warning">Awaiting approval</Status><Status tone="success">Received</Status></Stack></div>
                <figcaption><b>Tag and Status</b> Core’s, in NineSync’s greys; status always has its word.</figcaption>
              </figure>
              <figure className={styles.piece}>
                <div className={styles.pieceStage}><p className={styles.muted}>Its colors from one brand color, with checks. It’s the builder above.</p></div>
                <figcaption><b>ClientTheme · syncColors</b> NineSync only. {more('client')}</figcaption>
              </figure>
            </div>
          </Section>

          <Section id="voice" number="08" eyebrow="Voice" title="Like a good colleague" lede="Plain, short and specific. Say what happened and what to do next. The client’s brand voice goes in their content; the tool stays neutral.">
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.hidden}>How NineSync copy sounds</caption>
                <thead><tr><th scope="col">For</th><th scope="col"><span aria-hidden="true">✓</span> Say</th><th scope="col"><span aria-hidden="true">✕</span> Not</th></tr></thead>
                <tbody>
                  {VOICE.map(([what, say, not]) => (
                    <tr key={what}><th scope="row">{what}</th><td>{say}</td><td className={styles.muted}><s>{not}</s></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="dos" number="09" eyebrow="Do and don’t" title="Keep it calm" lede="Each rule with what it looks like, drawn with the real components.">
            <div className={styles.examples}>
              <Example good title="One filled action per view: the main one.">
                <Stack direction="row" gap={3} wrap><Button size="sm">Approve order</Button><Button size="sm" variant="secondary">Save draft</Button></Stack>
              </Example>
              <Example good={false} title="Every button filled, so nothing is the main action.">
                <Stack direction="row" gap={3} wrap><Button size="sm">Approve</Button><Button size="sm">Save</Button><Button size="sm">Export</Button></Stack>
              </Example>
              <Example good title="Ask for a second color when the brand color fails.">
                <span className={styles.exampleText}>“Your orange reads at 2.4:1 as text. Could we use your darker orange, #A3560D, for links and buttons?”</span>
              </Example>
              <Example good={false} title="Quietly darken the client’s color until it passes.">
                <span className={styles.exampleText}>The client sees a brown they never chose.</span>
              </Example>
              <Example good title="Status in a word, with its color.">
                <Status tone="warning">Awaiting approval</Status>
              </Example>
              <Example good={false} title="The pale tone as text.">
                <span className={styles.paleText}>Awaiting approval</span>
              </Example>
            </div>
          </Section>

          <section id="sample" className={styles.sample} aria-labelledby="sample-title">
            <Container>
              <Stack gap={3}>
                <Eyebrow number="10">Sample screen</Eyebrow>
                <h2 id="sample-title" className={styles.sampleTitle}>A materials screen, all of it working</h2>
                <p className={styles.lede}>A sample steel supplier, in the colors from the builder above. Pick a page or a tab, and press Receive on a row below its reorder point.</p>
              </Stack>
            </Container>
            <Sample colors={client} />
          </section>

          <Section id="downloads" number="11" eyebrow="Downloads" title="Take it to the client" lede="The default tokens and the theme file. A client’s own colors come from the builder: copy its ClientTheme line, or download its CSS.">
            <div className={styles.grid3}>
              <a className={styles.download} href="./downloads/tokens.css" download><b>tokens.css</b><span className={styles.muted}>Every <code>--r9-*</code> custom property, both moods, in the default colors.</span></a>
              <a className={styles.download} href="./downloads/tokens.json" download><b>tokens.json</b><span className={styles.muted}>The same tokens with names, values and what each is for.</span></a>
              <a className={styles.download} href="./downloads/theme.json" download><b>theme.json</b><span className={styles.muted}>NineSync’s name, moods, Auto rule and fonts.</span></a>
              <div className={styles.download}><b>Fonts</b><span className={styles.muted}>{FONTS.map(([name, , , href], i) => <span key={name}>{i ? ' · ' : ''}<a href={href}>{name}</a></span>)}</span></div>
            </div>
            <Stack gap={3}>
              <span className={styles.label}>Start an app</span>
              <CopyValue value="npm install @rnine/ninesync react react-dom" />
              <pre className={styles.code}><code>{`import '@rnine/ninesync/fonts.css';
import '@rnine/ninesync/styles.css';
import { ClientTheme, ThemeProvider, Button } from '@rnine/ninesync';
import logo from './logo.svg?raw';

export function App() {
  return (
    <ThemeProvider mark={{ full: logo }}>
      <ClientTheme colors={{ brand: '#F07F13', light: '#A3560D' }} />
      <Button>Approve order</Button>
    </ThemeProvider>
  );
}`}</code></pre>
            </Stack>
          </Section>

          <Section id="access" number="12" eyebrow="Accessibility" title="Readable all day" lede="Every text color meets WCAG 2.2 AA on what it sits on, in both moods, for the default colors (below) and for any client colors that pass the builder’s checks (fg-subtle is for large text only).">
            <ul className={styles.rules}>
              <li>Status is never color alone: a word goes with it, and the live dot has words or a name.</li>
              <li>The pale tone is decoration only. Text and links use the brand color or its second color, at 4.5:1.</li>
              <li>Tabs and the side nav keep core’s keyboard support; focus rings are 2px in the client’s color. Counts that animate read as their final number.</li>
            </ul>
            <ContrastTable schemes={tokens.schemes} moods={moods} />
          </Section>
        </main>
        <footer className={styles.footer}>
          <Container width="wide">
            <div className={styles.footInner}>
              <span className={styles.footBrand}><Mark size={28} /><Wordmark>NineSync</Wordmark></span>
              <span>{own?.package ?? '@rnine/ninesync'} v{__VERSION__} · MIT · fonts OFL</span>
              <span className={styles.footLinks}>
                {storybook && <a href={storybook}>Storybook <span aria-hidden="true">↗</span></a>}
                <a href="../">All themes</a>
              </span>
            </div>
          </Container>
        </footer>
      </div>
    </ThemeProvider>
  );
}

