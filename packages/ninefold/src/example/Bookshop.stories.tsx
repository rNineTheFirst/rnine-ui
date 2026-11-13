import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Status, Tag, TextArea, TextField } from '@rnine/core';
import { Backdrop, HeroLight, Ink, Magnet, TextReveal, rippleAt, swapIn, swapOut } from '../motion';
import { Button, Card, FieldJournal, LanternTrail, Mark, MoonDial, PenLink } from '../index';
import styles from './Bookshop.module.scss';

const BOOKS = [
  ['The Cartographer of Ash', 'M. Ellery', 'A mapmaker inks a city that burned a century ago, and it starts to answer back.', ['Signed', 'Sprayed edges'], 'In stock', '$34'],
  ['A Lantern for the Drowned Wood', 'S. Okafor-Lane', 'Two sisters row out to a forest under the lake to bring their mother’s light home.', ['Foil cover', 'Ribbon'], '3 left', '$29'],
  ['Nine Keys to the Hollow Court', 'J. Varga', 'A locksmith’s apprentice is hired to open a palace nobody remembers building.', ['First print'], 'In stock', '$27'],
  ['The Moth Archivist', 'R. Delacroix', 'In a library that only opens at night, the catalogue is kept by moths.', ['Preorder', 'Signed'], 'Ships Jan', '$32'],
] as const;
const EDITIONS = [
  ['Nov 2026', 'The Cartographer of Ash, ember edition', 'Signed · black-and-gold edges'],
  ['Nov 2026', 'A Lantern for the Drowned Wood', 'Foil case · ribbon marker'],
  ['Oct 2026', 'The Salt King’s Daughter', 'Numbered, 500 copies'],
  ['Sep 2026', 'Under the Ninth Bell', 'Map endpapers'],
];
const PREORDERS = [
  ['Jan 2027', 'The Moth Archivist', 'Signed · closes in 3 days'],
  ['Feb 2027', 'The Glass Orchard', 'Sprayed edges'],
  ['Mar 2027', 'Songs for a Sleeping Dragon', 'Illustrated, with a print'],
];
const JOURNAL = [
  { text: 'Unpacked forty copies of The Cartographer of Ash.', icon: 'leaf' as const },
  { text: 'A reader asked for a book about moths. We had two.', icon: 'moth' as const },
  { text: 'The moon is {moon}. Preorders close at midnight.', icon: 'moon' as const },
  { text: 'Pressed a sprig into every parcel today.', icon: 'leaf' as const },
  { text: 'Three fireflies by the window while wrapping orders.', icon: 'firefly' as const },
  { text: 'Mist on the glass. The kettle is on.', icon: 'moth' as const },
];
const PAGES = [
  { id: 'shelf', label: 'New', title: 'New on the shelf' },
  { id: 'editions', label: 'Editions', title: 'Special editions' },
  { id: 'preorders', label: 'Preorders', title: 'Preorders' },
  { id: 'contact', label: 'Write to us', title: 'Write to the shop' },
];

function Page({ id }: { id: string }) {
  const [sent, setSent] = useState(false);
  if (id === 'shelf') {
    return (
      <div className={styles.cards}>
        {BOOKS.map(([title, author, blurb, tags, stock, price]) => (
          <Card key={title} href="#" label={title}>
            <h3 className={styles.bookTitle}>{title}</h3>
            <p className={styles.author}>{author}</p>
            <p className={styles.blurb}>{blurb}</p>
            <div className={styles.row}>
              {tags.map((t) => <Tag key={t}>{t}</Tag>)}
              <Status tone={stock === 'In stock' ? 'live' : 'idle'} className={styles.stock}>{`${stock} · ${price}`}</Status>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  if (id === 'editions' || id === 'preorders') {
    return (
      <ul className={styles.list}>
        {(id === 'editions' ? EDITIONS : PREORDERS).map(([when, title, meta]) => (
          <li key={title}>
            <span className={styles.when}>{when}</span>
            <PenLink href="#" className={styles.listTitle}>{title}</PenLink>
            <span className={styles.meta}>{meta}</span>
          </li>
        ))}
      </ul>
    );
  }
  const send = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };
  return (
    <div className={styles.contact}>
      <div className={styles.about}>
        <p>A small shop for fantasy readers. Every book is a special edition: signed, sprayed, foiled or numbered, and every parcel leaves with a sealed note.</p>
        <p>Write if you’re hunting for a book, or want a copy held for you.</p>
      </div>
      <form className={styles.form} onSubmit={send}>
        <TextField label="Your name" placeholder="Wren" autoComplete="off" />
        <TextArea label="Your note" placeholder="Looking for a signed copy of…" />
        <div><Magnet><Button type="submit">Seal and send</Button></Magnet></div>
        <p className={styles.sent} role="status">{sent ? 'Sealed. This sample doesn’t send anything.' : ''}</p>
      </form>
    </div>
  );
}

function Bookshop() {
  const [open, setOpen] = useState<string | null>(null);
  const [shown, setShown] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const desk = useRef<HTMLElement>(null);
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setTime(new Date()), 30000);
    return () => window.clearInterval(t);
  }, []);

  // The swarm swap: the old page lifts off as fireflies or leaves, the new one gathers out of them
  const go = async (id: string | null) => {
    if (id === shown) return;
    if (panel.current && shown) await swapOut(panel.current);
    setShown(id);
    requestAnimationFrame(() => panel.current && swapIn(panel.current));
  };
  const openFromLink = (id: string) => {
    desk.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(id);
    void go(id);
  };
  const page = PAGES.find((p) => p.id === shown);

  return (
    <div className={styles.shop}>
      <Backdrop />
      <Ink />
      <header className={styles.nav}>
        <a className={styles.brand} href="#" onClick={(e) => { e.preventDefault(); const r = e.currentTarget.getBoundingClientRect(); rippleAt(r.left + 20, r.top + 20); }}>
          <Mark size={40} label="The Bookshop" />
          <span className={styles.name}>The Bookshop</span>
        </a>
        <nav className={styles.links} aria-label="Shop">
          {PAGES.map((p) => (
            <PenLink key={p.id} href={`#${p.id}`} current={open === p.id} onClick={(e) => { e.preventDefault(); openFromLink(p.id); }}>
              {p.label}
            </PenLink>
          ))}
          <time className={styles.clock}>{time.toTimeString().slice(0, 5)}</time>
        </nav>
      </header>

      <section className={styles.hero} aria-label="Welcome">
        <HeroLight />
        <div className={styles.copy}>
          <p className={styles.eyebrow}><span className={styles.drop} aria-hidden="true" />Fantasy books · special editions</p>
          <TextReveal as="h1" className={styles.headline} text="Books with a little magic bound in." trigger="mount" />
          <p className={styles.lede}>Signed copies, sprayed edges and preorders of new fantasy, packed by hand and sent with a sealed note.</p>
          <p className={styles.signature}>Sealed by hand</p>
          <div className={styles.actions}>
            <Magnet><Button onClick={() => openFromLink('shelf')}>Browse the shelf</Button></Magnet>
            <Magnet><Button variant="secondary" onClick={() => openFromLink('preorders')}>See preorders</Button></Magnet>
          </div>
        </div>
        <div className={styles.letter} aria-hidden="true">
          <span className={styles.letterFold} />
          <span className={styles.to}>To the reader,</span>
          <span className={styles.line}>a new book is on its way,</span>
          <span className={styles.line}>sealed with a little magic.</span>
          <span className={styles.seal}><Mark size={104} animate="mount" /></span>
        </div>
      </section>

      <section ref={desk} className={styles.desk} aria-labelledby="desk-title">
        <div>
          <h2 id="desk-title" className={styles.deskTitle}>The lantern trail</h2>
          <p className={styles.deskSub}>Pick a stop. The lantern walks there, and the page opens like a clearing.</p>
        </div>
        <LanternTrail label="Shop sections" stops={PAGES} value={open} controls="shop-page" onChange={(id) => void go(id)} />
        <div ref={panel} id="shop-page" className={styles.panel} role="tabpanel" aria-label={page?.title ?? 'The lantern is resting'}>
          {page ? (
            <>
              <div className={styles.panelHead}>
                <TextReveal as="h3" className={styles.panelTitle} text={page.title} trigger="mount" delay={200} />
                <Button variant="ghost" onClick={() => { setOpen(null); void go(null); }}>Close</Button>
              </div>
              <Page id={page.id} />
            </>
          ) : (
            <div className={styles.empty}>
              <Mark size={48} variant="simplified" />
              <p>The lantern is resting. Pick a stop on the trail.</p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.now} aria-label="Now">
        <article className={styles.nowCard} aria-label="Field journal">
          <div className={styles.nowHead}><span>Field journal</span><span>{time.toDateString().slice(4, 10)}</span></div>
          <FieldJournal entries={JOURNAL} />
        </article>
        <article className={styles.nowCard} aria-label="The sky">
          <div className={styles.nowHead}><span>The sky</span><span>Moon dial</span></div>
          <MoonDial />
        </article>
      </section>

      <footer className={styles.foot}>
        <p><b>Colophon</b> Set in Fraunces and Literata. Pressed paper, iron-gall ink, a wax seal with a sprig on every parcel. Golden hour by day, candlelight at night.</p>
        <nav aria-label="Footer"><PenLink href="#">Special editions</PenLink> <PenLink href="#">Write to us</PenLink></nav>
      </footer>
    </div>
  );
}

const meta = {
  title: 'Example/Bookshop',
  component: Bookshop,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A fantasy bookshop built with Ninefold (a sample: placeholder shop, books and mark). Everything moves the way the library does by default: the backdrop (leaves by day, fireflies at night), the title growing or gathering, the seal, the lantern trail and the swarm swap, the folded corners lifting, the wax-stamp buttons, the field journal and the moon dial. Drag on empty paper to write. Switch Glint and Gloam in the toolbar.',
      },
    },
  },
} satisfies Meta<typeof Bookshop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shop: Story = {};
