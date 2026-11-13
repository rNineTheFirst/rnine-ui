import { useState } from 'react';
import { Button, Card, Container, Eyebrow, Section, Stack, Tag, ThemeProvider, Wordmark } from '@rnine/core';
import { Backdrop, Mark, TextReveal } from '@rnine/core/motion';
import { tokens } from '../../dist/tokens.js';
import { ColorRoles, ContrastTable, CopyValue, KitHeader, MoodScope, ThemeCards } from '../shell';
import type { SiteInfo } from '../types';
import { CHAPTERS } from './chapters';
import styles from './App.module.scss';

declare const __STORIES__: { title: string; id: string }[];
declare const __VERSION__: string;

type Props = { site: SiteInfo };

const moods = tokens.moods;
const schemes = tokens.schemes;

/** The Storybook's stories by category ("Components", "Brand"), in order. */
const STORY_GROUPS = [...new Set(__STORIES__.map((s) => s.title.split('/')[0]))].map(
  (group) => [group, __STORIES__.filter((s) => s.title.startsWith(`${group}/`))] as const,
);

const MIXINS = [
  ['corner', 'Shapes corners from two tokens: shape-cut (how much is cut off) and shape-round (how round). NineOS cuts its corners; Ninefold rounds them.', 'corner'],
  ['card-corner', 'The top-right corner every card gets, sized by shape-card-cut. NineOS cuts it; Ninefold folds it.', 'cardCorner'],
  ['ornament', 'A small accent mark in the accent color: a bullet, square or round as the theme\'s shape tokens say.', 'ornament'],
  ['corner-ornament', 'An accent strip just inside a shaped corner.', 'cornerOrnament'],
  ['card-ornament', 'The accent strip in a card\'s corner.', 'cardOrnament'],
  ['texture', 'A surface texture: field (dots), grid, lines, fibers or grain.', 'texture'],
] as const;

const ROLES = [
  ['TextReveal', 'How a title appears.', 'Plain shows the text as it is. NineOS decodes it from terminal symbols; Ninefold grows the letters up by day and gathers them from fireflies at night.'],
  ['Backdrop', 'The field behind a page or a hero.', 'Plain: a still dotted field. NineOS: a reactive dot field; Ninefold: falling leaves by day, fireflies by night.'],
  ['Mark', 'The app\'s own mark, with the library\'s animation.', 'Plain: no animation. NineOS: a slice glitch; Ninefold: pressed into a seal of poured wax.'],
  ['PageEffects', 'Page-wide effects that answer the person using the page.', 'Plain: none. NineOS: scanlines and click sparks; Ninefold: click bursts and dew.'],
  ['swapIn / swapOut', 'The change between two panels or pages.', 'Plain: a short fade. NineOS: a top-down reveal and an RGB-split exit; Ninefold: a swarm of leaves by day, fireflies by night.'],
] as const;

const STEPS = [
  ['Tokens', <>Write the primitives and both moods' roles as JSON in <code>tokens/</code> (<code>themes/light.json</code>, <code>themes/dark.json</code>, with the same role names as core) and build them with <code>@rnine/core/build-tokens</code>.</>],
  ['theme.json', <>Name the theme and its two moods, the Auto rule, the fonts, a one-line <code>tagline</code> and, once it has one, its <code>monogram</code> (an SVG with filled paths).</>],
  ['Its look', <>Style with the shared mixins (<code>corner</code>, <code>card-corner</code>, <code>ornament</code>, <code>texture</code>...) through <code>@rnine/core/scss</code>; restyle a core component by exporting your own version with the same props.</>],
  ['The roles', <>Give a <code>ThemeConfig</code> your versions of the role effects (<code>@rnine/core/kit</code>), export your own <code>ThemeProvider</code>, and re-export everything else from core.</>],
  ['Check it', <>Run <code>@rnine/core/conformance</code>: it fails when the library is missing a name core exports, or a token core has.</>],
  ['Show it', <>Give it a Storybook and a brand kit. A package next to core with a <code>theme.json</code> shows up on this page and in core's Storybook by itself.</>],
] as const;

export function App({ site }: Props) {
  const [replay, setReplay] = useState(0);
  const storybook = site.docsUrl;
  const links = storybook ? [{ href: storybook, label: 'Storybook' }] : [];

  return (
    <ThemeProvider mark={site.mark ?? undefined}>
      <div className={styles.app}>
        <a className={styles.skip} href="#core">Skip to the kit</a>
        <KitHeader title="Core" chapters={CHAPTERS} links={links} />
        <main id="top">
          {/* Themes first: the page's first job is getting people to the one they want */}
          <section id="themes" className={styles.hero} aria-labelledby="themes-title">
            <Container width="wide">
              <Stack gap={8}>
                <Stack gap={3}>
                  <Eyebrow>@rnine/core · v{__VERSION__}</Eyebrow>
                  <TextReveal as="h1" id="themes-title" className={styles.heroTitle} text="Pick a theme" trigger="mount" />
                  <p className={styles.lede}>
                    Every theme is a full component library on the same core: the same components, props and tokens,
                    each in its own look. Open a theme's brand kit for its rules, or its Storybook for every component.
                  </p>
                </Stack>
                <ThemeCards themes={site.themes} site="kit" otherUrl={site.docsUrl} />
              </Stack>
            </Container>
          </section>

          <Section
            id="core"
            number="01"
            eyebrow="Core"
            title="One contract under every theme"
            lede={<>The rest of this kit is that contract, shown in <b>Plain</b>: core's own placeholder look, neutral grays and one blue accent.</>}
          >
            <div className={styles.grid3}>
              <Card interactive={false}>
                <Stack gap={2}>
                  <h3 className={styles.h3}>Same names</h3>
                  <p className={styles.muted}>Every theme exports core's components and effects with the same props, so an app changes theme by changing one import.</p>
                </Stack>
              </Card>
              <Card interactive={false}>
                <Stack gap={2}>
                  <h3 className={styles.h3}>Same tokens</h3>
                  <p className={styles.muted}>Every theme sets the same <code>--r9-*</code> custom properties and SCSS variables; only the values differ.</p>
                </Stack>
              </Card>
              <Card interactive={false}>
                <Stack gap={2}>
                  <h3 className={styles.h3}>Same moods</h3>
                  <p className={styles.muted}>Two moods each, kept on <code>&lt;html data-scheme="light|dark"&gt;</code>. Each theme names its own.</p>
                </Stack>
              </Card>
            </div>
          </Section>

          <Section id="roles" number="02" eyebrow="Color" title="Color roles" lede="Components use these roles, never raw colors. Each theme sets every role in both moods. Tap a name or a value to copy it.">
            <ColorRoles schemes={schemes} moods={moods} />
          </Section>

          <Section id="moods" number="03" eyebrow="Moods" title="Two moods, one attribute" lede={<>The mood lives on <code>&lt;html&gt;</code> as <code>data-scheme</code>. ThemeProvider keeps it: the viewer's choice, or the theme's Auto rule (the system setting, or for some themes the time of day).</>}>
            <div className={styles.grid2}>
              {(['light', 'dark'] as const).map((mood) => (
                <MoodScope key={mood} mood={mood} label={`${moods[mood].label} · data-scheme="${mood}"`}>
                  <Card interactive={false}>
                    <Stack gap={3} align="flex-start">
                      <Tag>{moods[mood].label}</Tag>
                      <h3 className={styles.h3}>{moods[mood].description}</h3>
                      <Stack direction="row" gap={3} wrap>
                        <Button size="sm">Primary</Button>
                        <Button size="sm" variant="outline">Outline</Button>
                      </Stack>
                    </Stack>
                  </Card>
                </MoodScope>
              ))}
            </div>
            <pre className={styles.code}><code>{`{
  "name": "Plain",
  "moods": {
    "light": { "id": "light", "label": "Light" },
    "dark": { "id": "dark", "label": "Dark" }
  },
  "auto": "system"
}`}</code></pre>
          </Section>

          <Section id="mixins" number="04" eyebrow="Shape" title="Shared shapes" lede="Components draw their shapes with these mixins only, never one theme's look. Each theme decides what they draw. Here are Plain's: it rounds a little and cuts nothing, so its corner strips stay hidden.">
            <div className={styles.grid3}>
              {MIXINS.map(([name, about, demo]) => (
                <div key={name} className={styles.mixin}>
                  <div className={styles[demo]} aria-hidden="true" />
                  <code>r9.{name}</code>
                  <p className={styles.muted}>{about}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="effects" number="05" eyebrow="Effects" title="Effects by role" lede="Every theme has the same five effects, each with its own version. Components ask for a role, never for one theme's effect.">
            <div className={styles.grid2}>
              <div className={styles.stage}>
                <Backdrop />
                <div className={styles.stageContent}>
                  <Mark size={56} animate="hover" />
                  <TextReveal key={replay} as="p" className={styles.stageTitle} text="A title that reveals itself" trigger="mount" />
                  <Button size="sm" variant="outline" onClick={() => setReplay((n) => n + 1)}>Play again</Button>
                </div>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className={styles.hidden}>The five roles</caption>
                  <thead><tr><th scope="col">Role</th><th scope="col">What it is</th><th scope="col">In each theme</th></tr></thead>
                  <tbody>
                    {ROLES.map(([name, what, how]) => (
                      <tr key={name}><th scope="row"><code>{name}</code></th><td>{what}</td><td className={styles.muted}>{how}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          <Section id="catalog" number="06" eyebrow="Components" title="What every theme has" lede={storybook ? 'Each one opens in the Storybook, in Plain. Every theme has all of them, in its own look.' : 'Every theme has all of them, in its own look.'}>
            {STORY_GROUPS.map(([group, titles]) => (
              <Stack key={group} gap={3}>
                <h3 className={styles.h3}>{group}</h3>
                <ul className={styles.catalog}>
                  {titles.map(({ title, id }) => {
                    const name = title.split('/').slice(1).join(' / ');
                    return (
                      <li key={title}>
                        {storybook ? <a href={`${storybook}?path=/story/${id}`}>{name}</a> : name}
                      </li>
                    );
                  })}
                </ul>
              </Stack>
            ))}
          </Section>

          <Section id="build" number="07" eyebrow="Build a theme" title="Making a theme on core" lede="A theme is a package next to core. These are the steps, in order.">
            <ol className={styles.steps}>
              {STEPS.map(([name, about]) => (
                <li key={name}><b>{name}.</b> {about}</li>
              ))}
            </ol>
          </Section>

          <Section id="downloads" number="08" eyebrow="Downloads" title="Take it with you" lede="Core's tokens and theme file. Each theme's kit has its own.">
            <div className={styles.grid3}>
              <a className={styles.download} href="./downloads/tokens.css" download>
                <b>tokens.css</b>
                <span className={styles.muted}>Every <code>--r9-*</code> custom property, both moods.</span>
              </a>
              <a className={styles.download} href="./downloads/tokens.json" download>
                <b>tokens.json</b>
                <span className={styles.muted}>The same tokens with names, values and what each is for.</span>
              </a>
              <a className={styles.download} href="./downloads/theme.json" download>
                <b>theme.json</b>
                <span className={styles.muted}>Plain's name, moods and Auto rule: a starting point for a theme.</span>
              </a>
            </div>
            <Stack gap={2}>
              <span className={styles.muted}>Install</span>
              <CopyValue value="npm install @rnine/core react react-dom" />
            </Stack>
          </Section>

          <Section id="contrast" number="09" eyebrow="Accessibility" title="Readable in both moods" lede="Every text role meets WCAG 2.2 AA on what it sits on, in both moods (fg-subtle is for large text only). Every effect stops when the system or the Motion switch asks for less motion.">
            <ContrastTable schemes={schemes} moods={moods} />
          </Section>
        </main>
        <footer className={styles.footer}>
          <Container width="wide">
            <div className={styles.footInner}>
              <span className={styles.footBrand}><Mark size={22} /><Wordmark>Core</Wordmark></span>
              <span>@rnine/core v{__VERSION__} · MIT</span>
              {storybook && <a href={storybook}>Storybook <span aria-hidden="true">↗</span></a>}
            </div>
          </Container>
        </footer>
      </div>
    </ThemeProvider>
  );
}
