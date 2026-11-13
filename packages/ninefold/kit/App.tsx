import { useRef, useState } from 'react';
import {
  Button,
  Card,
  Container,
  Eyebrow,
  FieldJournal,
  LanternTrail,
  MoonDial,
  PenLink,
  Section,
  Stack,
  Status,
  Tag,
  ThemeProvider,
  Wordmark,
} from '@rnine/ninefold';
import { Backdrop, HeroLight, Ink, Magnet, Mark, TextReveal, TiltCard, swapIn, swapOut } from '@rnine/ninefold/motion';
import { tokens } from '../dist/tokens.js';
import { ColorRoles, ContrastTable, CopyValue, KitHeader, MoodScope } from '../../core/site/shell';
import type { SiteInfo } from '../../core/site/types';
import { Bookshop } from '../src/example/Bookshop';
import { BOOK_MARK } from '../src/example/book';
import { CHAPTERS } from './chapters';
import styles from './App.module.scss';

declare const __VERSION__: string;

type Props = { site: SiteInfo };

const moods = tokens.moods;

/** Story ids in Ninefold's Storybook, for the component gallery. */
const STORY = {
  button: 'components-button--primary',
  card: 'components-card--interactive',
  fold: 'motion-effects--fold-and-stamp',
  trail: 'components-ninefold-only--lantern-trail-story',
  journal: 'components-ninefold-only--field-journal-story',
  moon: 'components-ninefold-only--moon-dial-story',
  pen: 'components-ninefold-only--pen-link-story',
  hero: 'motion-effects--hero-light-story',
  ink: 'motion-effects--ink-story',
} as const;

const FONTS = [
  ['Fraunces', 'font-display', 'Headings, the shop\'s name, numbers that matter; its italic is the hand in notes and journals.', 'https://fontsource.org/fonts/fraunces'],
  ['Literata', 'font-body', 'Running text and UI.', 'https://fontsource.org/fonts/literata'],
  ['Courier Prime', 'font-mono', 'Labels, eyebrows, dates and table heads: uppercase, tracked 0.13em.', 'https://fontsource.org/fonts/courier-prime'],
  ['Pinyon Script', 'font-script', 'A signature or a flourish. Never running text.', 'https://fontsource.org/fonts/pinyon-script'],
] as const;

const TUNED = [
  ['Fireflies / leaves', '0.5x / 0.4x per area; leaves at 0.6x size'],
  ['Fireflies', 'brightness 0.5x; circle the pointer 0.1x; scatter 0.2x; a flash wave every 5 s at rest'],
  ['Title gather', '480 fireflies, 1100 ms'],
  ['Title grow', '640 ms a letter, 10 ms apart'],
  ['Folded corner', '26 → 60 px, from 450 px away, follows at 0.4'],
  ['Ink', '2 px pen, stays 1 s; touch: hold 300 ms'],
  ['Lantern', 'walks at 1.2x; a mote behind it on 20% of frames'],
  ['Swarm swap', '80 fireflies or leaves, at 0.8x the base timings'],
  ['Wax stamp / seal', 'ring spreads to 2.4x; sprig sways 8°'],
  ['Pen underline', '500 ms'],
  ['Night sky', '0.8x stars'],
  ['Click burst', '5 leaves or 6 fireflies'],
  ['Field journal', 'a note every 6.5 s'],
  ['Hero light', 'window 0.6x; candle glow 0.9x; flicker 0.5'],
] as const;

const VOICE = [
  ['A product', 'Signed, sprayed edges, ships in January.', 'A truly magical, enchanting edition you’ll treasure forever!'],
  ['Stock', '3 left · ships Tuesday', 'Hurry!! Almost gone!'],
  ['A button', 'Seal and send', 'Submit'],
  ['Nothing yet', 'The lantern is resting. Pick a stop on the trail.', 'Nothing here!'],
  ['Something went wrong', 'Your note didn’t send. Check your connection and try again; it’s still here.', 'Oops! The spirits are restless.'],
] as const;

const STOPS = [
  { id: 'new', label: 'New' },
  { id: 'editions', label: 'Editions' },
  { id: 'preorders', label: 'Preorders' },
  { id: 'contact', label: 'Write to us' },
];

const JOURNAL = [
  { text: 'Unpacked forty copies of The Cartographer of Ash.', icon: 'leaf' as const },
  { text: 'The moon is {moon}. Preorders close at midnight.', icon: 'moon' as const },
  { text: 'Three fireflies by the window while wrapping orders.', icon: 'firefly' as const },
  { text: 'A reader asked for a book about moths. We had two.', icon: 'moth' as const },
];

const SWAP = [
  ['New on the shelf', 'Four new books this week, two of them signed.'],
  ['Preorders', 'The Moth Archivist ships in January. Preorders close in three days.'],
] as const;

/** One Do or Don't example. Status is in a word and a symbol, never color alone. */
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

export function App({ site }: Props) {
  const own = site.themes.find((t) => t.id === 'ninefold');
  // The seal carries Ninefold's own monogram once it has one; until then the sample shop's book
  const mark = own?.monogram ? { full: own.monogram } : BOOK_MARK;
  const storybook = site.docsUrl ? `${site.docsUrl}ninefold/` : null;
  const story = (id: string) => (storybook ? `${storybook}?path=/story/${id}` : null);
  const [replay, setReplay] = useState(0);
  const [stop, setStop] = useState<string | null>('new');
  const [swapped, setSwapped] = useState(0);
  const swapRef = useRef<HTMLDivElement>(null);

  const swap = async () => {
    if (swapRef.current) await swapOut(swapRef.current);
    setSwapped((n) => (n + 1) % SWAP.length);
    requestAnimationFrame(() => swapRef.current && swapIn(swapRef.current));
  };

  const links = [
    ...(storybook ? [{ href: storybook, label: 'Storybook' }] : []),
    { href: '../', label: 'All themes' },
  ];

  return (
    <ThemeProvider mark={mark}>
      <div className={styles.app}>
        <a className={styles.skip} href="#principles">Skip to the kit</a>
        <KitHeader title="Ninefold" chapters={CHAPTERS} links={links} />
        <main id="top">
          {/* Opening: the hero the library would give a shop */}
          <section className={styles.hero} aria-labelledby="hero-title">
            <HeroLight />
            <div className={styles.heroInner}>
              <div className={styles.heroCopy}>
                <Eyebrow>{own?.package ?? '@rnine/ninefold'} · v{__VERSION__}</Eyebrow>
                <TextReveal as="h1" id="hero-title" className={styles.heroTitle} text="Ninefold" trigger="mount" />
                <p className={styles.lede}>
                  A cozy-fantasy design system for shops and sites with a little magic in them: paper, ink, wax and
                  candlelight, leaves by day and fireflies at night.
                </p>
                <p className={styles.moodsLine}>
                  <b>{moods.light.label}</b> {moods.light.description} <b>{moods.dark.label}</b> {moods.dark.description}
                </p>
                <div className={styles.actions}>
                  {storybook && <Magnet><Button href={storybook}>Open the Storybook</Button></Magnet>}
                  <Magnet><Button variant="secondary" href="#downloads">Take the tokens</Button></Magnet>
                </div>
              </div>
              <div className={styles.heroSeal}>
                <Mark size={180} animate="mount" label="The seal" />
                <span className={styles.signature}>Sealed by hand</span>
              </div>
            </div>
          </section>

          <Section id="principles" number="01" eyebrow="Principles" title="A desk you’d want to sit at" lede="For shops and sites with a little magic in them: a bookshop for fantasy readers, a maker of candles or maps, a tea room, a tabletop game. Cozy, crafted, a little enchanted. Never twee, never a costume.">
            <div className={styles.grid3}>
              <Card interactive={false}>
                <h3 className={styles.h3}>Two moods</h3>
                <p className={styles.muted}><b>{moods.light.label}</b> is the day: honey paper, iron-gall ink, claret wax. <b>{moods.dark.label}</b> is the night: a walnut desk by candlelight. Auto follows the clock. Nothing exists in only one of them; only the light changes.</p>
              </Card>
              <Card interactive={false}>
                <h3 className={styles.h3}>Ink and wax</h3>
                <p className={styles.muted}><b>Ink</b> (the accent) is for what you do: the main action, a focus ring, the pen line under a link. <b>Wax</b> (the signal) is for what’s live: stock, a date that matters, the seal.</p>
              </Card>
              <Card interactive={false}>
                <h3 className={styles.h3}>Soft corners, folded cards</h3>
                <p className={styles.muted}>Corners are rounded to their size. Only cards fold: the top-right corner is turned over, and it lifts toward the pointer.</p>
              </Card>
              <Card interactive={false}>
                <h3 className={styles.h3}>Paper behind everything</h3>
                <p className={styles.muted}>Pressed fibers and a fine grain sit behind every page. The only shadows are under a fold and under a letter.</p>
              </Card>
              <Card interactive={false}>
                <h3 className={styles.h3}>A seal for the mark</h3>
                <p className={styles.muted}>The shop’s own mark, pressed into wax, with a sprig tucked behind it.</p>
              </Card>
              <Card interactive={false}>
                <h3 className={styles.h3}>Things move like real things</h3>
                <p className={styles.muted}>Leaves fall, fireflies blink, ink dries, a seal is pressed. Nothing waits on an animation, and all of it stops for reduced motion.</p>
              </Card>
            </div>
          </Section>

          <Section id="seal" number="02" eyebrow="Seal and wordmark" title="The seal carries the shop’s mark" lede={<>Ninefold has no logo of its own to put on a shop. Each shop passes its own mark (<code>ThemeProvider mark</code>, an SVG with filled paths) and every <code>Mark</code> presses it into wax. Here it’s a sample shop’s open book.</>}>
            <div className={styles.grid2}>
              {(['light', 'dark'] as const).map((mood) => (
                <MoodScope key={mood} mood={mood} label={`${moods[mood].label} · ${mood}`}>
                  <div className={styles.sealRow}>
                    <Mark size={120} label={`The seal in ${moods[mood].label}`} />
                    <Mark size={56} />
                    <Mark size={32} />
                    <Mark size={24} variant="simplified" />
                  </div>
                  <div className={styles.lockup}>
                    <Mark size={40} />
                    <Wordmark>The Bookshop</Wordmark>
                  </div>
                </MoodScope>
              ))}
            </div>
            <ul className={styles.rules}>
              <li><b>Sizes.</b> The full seal (wax and sprig) from 32px up; at 24px and below use <code>variant="simplified"</code>, the seal alone.</li>
              <li><b>The mark inside.</b> One color, filled paths, a simple silhouette: it’s pressed in, so fine lines and thin strokes disappear. Give a <code>simplified</code> version with heavier strokes for small sizes.</li>
              <li><b>Color.</b> The wax follows the mood (claret by day, deeper by night). Don’t recolor it to the shop’s brand color: wax is for what’s live.</li>
              <li><b>Lockup.</b> The seal sits left of the shop’s name, set as a <code>Wordmark</code> or in Fraunces, with at least half the seal’s width between them.</li>
              <li><b>Space.</b> Keep the sprig clear: nothing within a quarter of the seal’s width around it, and never over a busy photo.</li>
            </ul>
          </Section>

          <Section id="color" number="03" eyebrow="Color" title="Paper, ink and wax" lede="Components use these roles, never raw colors. Each role is a CSS custom property and an SCSS variable; the mood switches them all. Tap a name or a value to copy it.">
            <ColorRoles schemes={tokens.schemes} moods={moods} />
          </Section>

          <Section id="type" number="04" eyebrow="Type" title="Four faces, each with one job" lede="All self-hosted through Fontsource under the SIL Open Font License (@rnine/ninefold/fonts.css). Use the type roles, not raw sizes.">
            <div className={styles.fonts}>
              {FONTS.map(([name, token, use, href]) => (
                <div key={name} className={styles.font}>
                  <span className={styles.specimen} style={{ fontFamily: `var(--r9-${token})` }}>
                    {token === 'font-script' ? 'Sealed by hand' : token === 'font-mono' ? 'Ships in January' : 'Books with a little magic bound in'}
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
                    {r.name === 'code' ? 'moonPhase(new Date())' : 'The lantern walks to the stop you pick'}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="paper" number="05" eyebrow="Shape and paper" title="Soft corners and a turned-over page" lede="Corners are rounded to their size. Cards fold, and only cards. Edges are hairlines; the only shadows are under a fold and under a letter.">
            <div className={styles.grid3}>
              <div className={styles.shape}><div className={styles.cornerSm} /><code>r9.corner(sm)</code><span className={styles.muted}>6px: chips, inputs</span></div>
              <div className={styles.shape}><div className={styles.cornerMd} /><code>r9.corner(md)</code><span className={styles.muted}>12px: buttons, panels</span></div>
              <div className={styles.shape}><div className={styles.cornerLg} /><code>r9.corner(lg)</code><span className={styles.muted}>18px: cards</span></div>
            </div>
            <div className={styles.grid2}>
              <Card>
                <h3 className={styles.h3}>Card</h3>
                <p className={styles.muted}>Move the pointer toward the corner (or tap it): the fold lifts from 26 to 60px and shows its lining.</p>
              </Card>
              <TiltCard>
                <div className={styles.tilt}>
                  <h3 className={styles.h3}>TiltCard</h3>
                  <p className={styles.muted}>The same fold, with a warm light that follows the pointer across it.</p>
                </div>
              </TiltCard>
            </div>
            <div className={styles.grid3}>
              <div className={styles.shape}><div className={styles.paperSample} /><code>r9.texture(fibers) + texture(grain)</code><span className={styles.muted}>The paper behind every page</span></div>
              <div className={styles.shape}><div className={styles.letter}><span>To the reader,</span><span>a new book is on its way.</span></div><code>lined paper</code><span className={styles.muted}>A tint of the text color, 34px apart</span></div>
              <div className={styles.shape}>
                <div className={styles.ornaments}><span className={styles.inkDrop} /><span className={styles.waxDrop} /><a href="#paper" className={styles.pen}>A pen line</a></div>
                <code>r9.ornament · r9.wax-drop · r9.pen-underline</code>
                <span className={styles.muted}>A drop of ink, a drop of wax, the pen under a link</span>
              </div>
            </div>
          </Section>

          <Section id="motion" number="06" eyebrow="Motion" title="Everything moves the way something real would" lede={`Effects answer the person using the page, or drift slowly enough to ignore. Switch between ${moods.light.label} and ${moods.dark.label} at the top to see both versions.`}>
            <div className={styles.grid2}>
              <div className={styles.stage}>
                <Backdrop />
                <div className={styles.stageContent}>
                  <span className={styles.stageLabel}>Backdrop · TextReveal</span>
                  <TextReveal key={replay} as="p" className={styles.stageTitle} text="Leaves by day, fireflies by night" trigger="mount" />
                  <Button size="sm" variant="secondary" onClick={() => setReplay((n) => n + 1)}>Reveal again</Button>
                </div>
              </div>
              <div className={styles.stage}>
                <div className={styles.stageContent}>
                  <span className={styles.stageLabel}>swapIn · swapOut</span>
                  <div ref={swapRef} className={styles.swapPanel}>
                    <h3 className={styles.h3}>{SWAP[swapped][0]}</h3>
                    <p className={styles.muted}>{SWAP[swapped][1]}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => void swap()}>Turn the page</Button>
                </div>
              </div>
              <div className={styles.stage}>
                <Ink hint={false} />
                <div className={styles.stageContent}>
                  <span className={styles.stageLabel}>Ink (opt-in)</span>
                  <p className={styles.muted}>Drag across the empty paper here to write (on touch, press and hold first). The ink dries and fades.</p>
                </div>
              </div>
              <div className={styles.stage}>
                <div className={styles.stageContent}>
                  <span className={styles.stageLabel}>Mark · Button · PageEffects</span>
                  <Mark size={72} label="Hover to press the seal" />
                  <p className={styles.muted}>Hover the seal to press it again. Press the button: it stamps like a seal. Click anywhere for a burst of leaves or fireflies.</p>
                  <Magnet><Button size="sm">Stamp it</Button></Magnet>
                </div>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.hidden}>The tuned motion values</caption>
                <thead><tr><th scope="col">What</th><th scope="col">The tuned value (the default)</th></tr></thead>
                <tbody>{TUNED.map(([what, value]) => <tr key={what}><th scope="row">{what}</th><td>{value}</td></tr>)}</tbody>
              </table>
            </div>
            <ul className={styles.rules}>
              <li>Content never waits: a title is readable the moment it’s there, a page is usable while its swarm settles.</li>
              <li>Everything stops for reduced motion (the system setting, the viewer’s Still, or <code>ThemeProvider reducedMotion</code>): the backdrop becomes a still scene, the rest simply appears.</li>
              <li>Effects never take clicks and are hidden from screen readers.</li>
            </ul>
          </Section>

          <Section id="components" number="07" eyebrow="Components" title="What Ninefold adds and restyles" lede={<>Every core component is here, in Ninefold’s look{storybook ? <> (see them all in the <a href={storybook}>Storybook</a>)</> : null}. These are the ones Ninefold restyles or has only for itself.</>}>
            <div className={styles.gallery}>
              <figure className={styles.piece}>
                <div className={styles.pieceStage}><Stack direction="row" gap={3} wrap align="center"><Button>Seal and send</Button><Button variant="secondary">Preorders</Button><Button variant="ghost">Close</Button></Stack></div>
                <figcaption><b>Button</b> Stamps like a seal when pressed. {story(STORY.button) && <a href={story(STORY.button)!}>Storybook <span aria-hidden="true">↗</span></a>}</figcaption>
              </figure>
              <figure className={styles.piece}>
                <div className={styles.pieceStage}><Stack gap={2}><PenLink href="#components">Special editions</PenLink><PenLink href="#components" current>Preorders</PenLink></Stack></div>
                <figcaption><b>PenLink</b> A pen draws a line under it. {story(STORY.pen) && <a href={story(STORY.pen)!}>Storybook <span aria-hidden="true">↗</span></a>}</figcaption>
              </figure>
              <figure className={`${styles.piece} ${styles.wide}`}>
                <div className={styles.pieceStage}><LanternTrail label="Sample shop sections" stops={STOPS} value={stop} onChange={setStop} /></div>
                <figcaption><b>LanternTrail</b> Navigation as a trail: the lantern walks to the stop you pick. {story(STORY.trail) && <a href={story(STORY.trail)!}>Storybook <span aria-hidden="true">↗</span></a>}</figcaption>
              </figure>
              <figure className={styles.piece}>
                <div className={styles.pieceStage}><FieldJournal entries={JOURNAL} shown={2} /></div>
                <figcaption><b>FieldJournal</b> Dated notes in a hand, written in one by one. {story(STORY.journal) && <a href={story(STORY.journal)!}>Storybook <span aria-hidden="true">↗</span></a>}</figcaption>
              </figure>
              <figure className={styles.piece}>
                <div className={styles.pieceStage}><MoonDial /></div>
                <figcaption><b>MoonDial</b> The sun and today’s real moon on an arc. {story(STORY.moon) && <a href={story(STORY.moon)!}>Storybook <span aria-hidden="true">↗</span></a>}</figcaption>
              </figure>
              <figure className={styles.piece}>
                <div className={styles.pieceStage}><Stack direction="row" gap={2} wrap><Tag>Signed</Tag><Tag>Sprayed edges</Tag><Status tone="live">In stock · $34</Status></Stack></div>
                <figcaption><b>Tag and Status</b> Core’s, in Ninefold’s ink and wax.</figcaption>
              </figure>
              <figure className={styles.piece}>
                <div className={styles.pieceStage}><p className={styles.muted}>Sun through a window by day; a candle and stars at night. It’s over the opening of this page.</p></div>
                <figcaption><b>HeroLight</b> Light over a hero. {story(STORY.hero) && <a href={story(STORY.hero)!}>Storybook <span aria-hidden="true">↗</span></a>}</figcaption>
              </figure>
            </div>
          </Section>

          <Section id="voice" number="08" eyebrow="Voice" title="Like a note tucked into a parcel" lede="Warm, plain and specific. Say what the thing is, not how magical it is. A little wonder is welcome in names and small touches; instructions stay plain.">
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.hidden}>How Ninefold copy sounds</caption>
                <thead><tr><th scope="col">For</th><th scope="col"><span aria-hidden="true">✓</span> Say</th><th scope="col"><span aria-hidden="true">✕</span> Not</th></tr></thead>
                <tbody>
                  {VOICE.map(([what, say, not]) => (
                    <tr key={what}><th scope="row">{what}</th><td>{say}</td><td className={styles.muted}><s>{not}</s></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="dos" number="09" eyebrow="Do and don’t" title="Keep the magic small" lede="Each rule with what it looks like, drawn with the real components.">
            <div className={styles.examples}>
              <Example good title="One inked action per view: the main one.">
                <Stack direction="row" gap={3} wrap><Button size="sm">Browse the shelf</Button><Button size="sm" variant="ghost">Preorders</Button></Stack>
              </Example>
              <Example good={false} title="Ink on everything, so nothing is the main action.">
                <Stack direction="row" gap={3} wrap><Button size="sm">Browse</Button><Button size="sm">Preorders</Button><Button size="sm">Write</Button></Stack>
              </Example>
              <Example good title="Wax for what’s live: stock, a date that matters.">
                <Status tone="live">3 left · ships Tuesday</Status>
              </Example>
              <Example good={false} title="Wax as a second brand color.">
                <span className={styles.waxHeading}>Autumn reading list</span>
              </Example>
              <Example good title="Script for a signature or a flourish.">
                <span className={styles.signatureSmall}>Sealed by hand</span>
              </Example>
              <Example good={false} title="Script for running text.">
                <span className={styles.scriptParagraph}>Every book is a special edition: signed, sprayed, foiled or numbered.</span>
              </Example>
              <Example good title="Only cards fold.">
                <span className={styles.miniCard}>A card</span>
              </Example>
              <Example good={false} title="Folding buttons, chips or images.">
                <span className={styles.foldedButton}>Browse</span>
              </Example>
            </div>
          </Section>

          <section id="sample" className={styles.sample} aria-labelledby="sample-title">
            <Container>
              <Stack gap={3}>
                <Eyebrow number="10">Bookshop</Eyebrow>
                <h2 id="sample-title" className={styles.sampleTitle}>A sample shop, all of it working</h2>
                <p className={styles.lede}>A placeholder shop, books and mark. Pick a stop on the lantern trail, press the seal, and drag on empty paper to write.</p>
              </Stack>
            </Container>
            <div className={styles.shopFrame}>
              <Bookshop />
            </div>
          </section>

          <Section id="downloads" number="11" eyebrow="Downloads" title="Take it to the shop" lede="The tokens, the theme file and the seal. The seal files carry a sample mark: replace the group named your-mark with the shop’s own.">
            <div className={styles.grid3}>
              <a className={styles.download} href="./downloads/tokens.css" download><b>tokens.css</b><span className={styles.muted}>Every <code>--r9-*</code> custom property, both moods.</span></a>
              <a className={styles.download} href="./downloads/tokens.json" download><b>tokens.json</b><span className={styles.muted}>The same tokens with names, values and what each is for.</span></a>
              <a className={styles.download} href="./downloads/theme.json" download><b>theme.json</b><span className={styles.muted}>Ninefold’s name, moods, Auto rule and fonts.</span></a>
              <a className={styles.download} href="./downloads/seal-glint.svg" download><b>seal-glint.svg</b><span className={styles.muted}>The seal in {moods.light.label}’s wax, as a template.</span></a>
              <a className={styles.download} href="./downloads/seal-gloam.svg" download><b>seal-gloam.svg</b><span className={styles.muted}>The seal in {moods.dark.label}’s wax, as a template.</span></a>
              <div className={styles.download}><b>Fonts</b><span className={styles.muted}>{FONTS.map(([name, , , href], i) => <span key={name}>{i ? ' · ' : ''}<a href={href}>{name}</a></span>)}</span></div>
            </div>
            <Stack gap={3}>
              <span className={styles.label}>Start a shop</span>
              <CopyValue value="npm install @rnine/ninefold react react-dom" />
              <pre className={styles.code}><code>{`import '@rnine/ninefold/fonts.css';
import '@rnine/ninefold/styles.css';
import { ThemeProvider, Button } from '@rnine/ninefold';
import shopMark from './mark.svg?raw';

export function App() {
  return (
    <ThemeProvider mark={{ full: shopMark }}>
      <Button>Browse the shelf</Button>
    </ThemeProvider>
  );
}`}</code></pre>
            </Stack>
          </Section>

          <Section id="access" number="12" eyebrow="Accessibility" title="Cozy for everyone" lede="Every text color meets WCAG 2.2 AA on what it sits on, in both moods (fg-subtle is for large text only).">
            <ul className={styles.rules}>
              <li>Status is never color alone: a word or an icon goes with it.</li>
              <li>Effects are decorative and hidden from screen readers; titles that animate always read as their final text. The lantern trail is a tab list with arrow keys.</li>
              <li>Writing on the page (<code>Ink</code>) is opt-in, never starts on text, links or controls, and is off with reduced motion.</li>
            </ul>
            <ContrastTable schemes={tokens.schemes} moods={moods} />
          </Section>
        </main>
        <footer className={styles.footer}>
          <Container width="wide">
            <div className={styles.footInner}>
              <span className={styles.footBrand}><Mark size={28} /><Wordmark>Ninefold</Wordmark></span>
              <span>{own?.package ?? '@rnine/ninefold'} v{__VERSION__} · MIT · fonts OFL</span>
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
