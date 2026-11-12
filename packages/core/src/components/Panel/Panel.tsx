import { useContext, useEffect, useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import { RevealOnce } from '../../hooks/motion';
import { useTheme } from '../../provider/ThemeProvider';
import { cx } from '../../utils/cx';
import { usePanelEnterDelay } from './stageContext';
import styles from './Panel.module.scss';

type Props = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  /** Small inverse chip before the title, e.g. "WHOAMI" or "CASE FILE". */
  index?: string;
  title: string;
  /** Heading level. Default 2; 1 when the panel is the whole page (e.g. a sign-in page). */
  level?: 1 | 2 | 3;
  /** Reveal the title (the library's TextReveal) when the panel appears. Default true. */
  reveal?: boolean;
  children?: ReactNode;
};

const SEEN_KEY = 'r9-revealed';
let seenThisVisit: Set<string> | null = null;

/** Titles already revealed in this session (sessionStorage; this page only when blocked). */
function seen(): Set<string> {
  if (seenThisVisit) return seenThisVisit;
  try {
    seenThisVisit = new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? '[]') as string[]);
  } catch {
    seenThisVisit = new Set();
  }
  return seenThisVisit;
}

function markSeen(title: string) {
  const s = seen();
  if (s.has(title)) return;
  s.add(title);
  try {
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...s].slice(-200)));
  } catch {
    // Remembered for this page only
  }
}

/**
 * A glass panel for content that floats over the backdrop: index chip,
 * revealing title (the library's TextReveal), and the corner ornament (its
 * accent element). Inside a PanelStage, the title waits for the stage's swap
 * before it reveals. With ThemeProvider revealOnce, a title reveals only the
 * first time it appears in a session.
 */
export function Panel({ index, title, level = 2, reveal = true, className, children, ...rest }: Props) {
  const { TextReveal } = useTheme().slots;
  const id = useId();
  const delay = usePanelEnterDelay();
  const once = useContext(RevealOnce);
  // Decided once per mount: a title already seen this session is simply there
  const [decode] = useState(() => reveal && !(once && seen().has(title)));
  useEffect(() => {
    if (decode && once) markSeen(title);
  }, [decode, once, title]);
  const Heading = `h${level}` as const;
  return (
    <section {...rest} className={cx(styles.panel, className)} aria-labelledby={`${id}-title`}>
      <header className={styles.head}>
        {index && <span className={styles.index}>{index}</span>}
        {decode ? (
          <TextReveal as={Heading} id={`${id}-title`} className={styles.title} text={title} trigger="mount" delay={delay} />
        ) : (
          <Heading id={`${id}-title`} className={styles.title}>{title}</Heading>
        )}
      </header>
      {children}
    </section>
  );
}
