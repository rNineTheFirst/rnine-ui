import { Mark, MoodToggle, MotionToggle, Wordmark } from '@rnine/core';
import styles from './shell.module.scss';

type Props = {
  /** The kit's name, set as the wordmark. */
  title: string;
  /** Chapters in page order: [anchor id, label]. */
  chapters: readonly (readonly [string, string])[];
  /** Links at the end of the bar (e.g. to the Storybook), in the library's link style. */
  links?: { href: string; label: string }[];
};

/** A brand kit's sticky bar: mark and name, the chapter index, mood and motion switches. */
export function KitHeader({ title, chapters, links = [] }: Props) {
  return (
    <header className={styles.bar}>
      <div className={styles.barInner}>
        <a className={styles.brand} href="#top" aria-label={`${title}, back to top`}>
          <Mark size={28} animate="mount" />
          <Wordmark>{title}</Wordmark>
        </a>
        <nav className={styles.nav} aria-label="Chapters">
          {chapters.map(([id, label]) => (
            <a key={id} href={`#${id}`}>{label}</a>
          ))}
          {links.map((link) => (
            <a key={link.href} href={link.href} className={styles.out}>
              {link.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
        <div className={styles.controls}>
          <MoodToggle />
          <MotionToggle />
        </div>
      </div>
    </header>
  );
}
