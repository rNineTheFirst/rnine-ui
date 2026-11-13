import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '@rnine/core/kit';
import { useReducedMotion } from '@rnine/core/motion';
import { moonPhase } from '../MoonDial/moon';
import styles from './FieldJournal.module.scss';

export type JournalEntry = {
  /** The note. "{moon}" becomes tonight's moon phase, e.g. "waxing gibbous". */
  text: string;
  /** The sketch beside it. Default: leaf. */
  icon?: 'leaf' | 'moth' | 'moon' | 'firefly';
};

export type FieldJournalProps = {
  /** The notes, written in this order and then again from the top. */
  entries: JournalEntry[];
  /** A new note every this many seconds (default 6.5, tuned). */
  every?: number;
  /** How many notes show at once (default 3). */
  shown?: number;
  /** Locale for the dates, e.g. "en-GB". Default: the browser's. */
  locale?: string;
  className?: string;
};

const ICONS: Record<NonNullable<JournalEntry['icon']>, ReactNode> = {
  leaf: (
    <>
      <path d="M4 20C6 10 12 5 21 4c-1 9-6 15-16 16z" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M5 19L15 9" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  moth: <path d="M12 7v12M12 9C9 4 3 5 4 10c1 4 5 4 8 2M12 9c3-5 9-4 8 1-1 4-5 4-8 2M12 13c-3 1-6 4-4 6 2 1 3-2 4-3M12 13c3 1 6 4 4 6-2 1-3-2-4-3" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />,
  moon: <path d="M15 3a9 9 0 1 0 6 13A8 8 0 0 1 15 3z" strokeWidth="1.6" strokeLinejoin="round" />,
  firefly: (
    <>
      <circle cx="12" cy="14" r="3" fill="currentColor" opacity="0.5" stroke="none" />
      <circle cx="12" cy="14" r="6.5" strokeWidth="1.2" opacity="0.6" />
      <path d="M12 11V6M9 7l3 -2 3 2" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
};

type Note = { key: number; entry: JournalEntry; at: Date; fresh: boolean };

const WORD_MS = 80;
const MINUTES_APART = 47;

/**
 * A field journal that keeps itself: dated notes in a hand, each with a
 * small sketch. Every few seconds, while it's on screen, the oldest note
 * folds away and a new one is written in, word by word. With reduced
 * motion the notes stay as they are.
 */
export function FieldJournal({ entries, every = 6.5, shown = 3, locale, className }: FieldJournalProps) {
  const reduced = useReducedMotion();
  const [notes, setNotes] = useState<Note[]>(() => {
    const now = Date.now();
    return Array.from({ length: Math.min(shown, entries.length) }, (_, i) => ({ key: i, entry: entries[i], at: new Date(now - (shown - i) * MINUTES_APART * 60000), fresh: false }));
  });
  const next = useRef(notes.length);
  const listRef = useRef<HTMLUListElement>(null);
  const visible = useRef(false);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    }, { threshold: 0.1 });
    io.observe(list);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !entries.length) return;
    const tick = window.setInterval(() => {
      if (!visible.current || document.hidden) return;
      const first = listRef.current?.firstElementChild as HTMLElement | null;
      const write = () =>
        setNotes((list) => {
          const i = next.current++;
          return [...list.slice(list.length >= shown ? 1 : 0), { key: i, entry: entries[i % entries.length], at: new Date(), fresh: true }];
        });
      if (first && typeof first.animate === 'function' && notes.length >= shown) {
        const fold = first.animate([{ opacity: 1, height: `${first.offsetHeight}px` }, { opacity: 0, height: '0px', paddingTop: '0px', paddingBottom: '0px' }], { duration: 420, easing: 'ease-in', fill: 'forwards' });
        fold.onfinish = write;
      } else write();
    }, every * 1000);
    return () => window.clearInterval(tick);
  }, [reduced, entries, every, shown, notes.length]);

  const stamp = (d: Date) =>
    `${new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(d)} · ${new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(d)}`;

  return (
    <ul ref={listRef} className={cx(styles.journal, className)}>
      {notes.map(({ key, entry, at, fresh }) => {
        const text = entry.text.replace('{moon}', moonPhase(at).name.toLowerCase());
        return (
          <li key={key} className={styles.note}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" focusable="false">{ICONS[entry.icon ?? 'leaf']}</svg>
            <time className={styles.when} dateTime={at.toISOString()}>{stamp(at)}</time>
            <span className={cx(styles.text, fresh && styles.fresh)}>
              {text.split(' ').map((word, i) => (
                <span key={i} style={fresh ? { animationDelay: `${i * WORD_MS}ms` } : undefined}>
                  {word}{' '}
                </span>
              ))}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
