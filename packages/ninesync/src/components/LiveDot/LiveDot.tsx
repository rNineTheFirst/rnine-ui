import type { ReactNode } from 'react';
import { cx } from '@rnine/core/kit';
import styles from './LiveDot.module.scss';

type Props = {
  /** Beside the dot: "Synced 2 min ago". Without it, `title` names the dot for screen readers. */
  children?: ReactNode;
  /** live: green, sending out a soft ring every 3.2s. idle: grey and still. Default live. */
  state?: 'live' | 'idle';
  /** The dot's name when there's no visible text. Default "Live" or "Idle". */
  title?: string;
  className?: string;
};

/**
 * The one thing in NineSync that moves on its own: a green dot that sends
 * out a soft ring every 3.2 seconds while data is live (synced, connected).
 * Still with reduced motion. Never color alone: give it words.
 */
export function LiveDot({ children, state = 'live', title, className }: Props) {
  const name = title ?? (state === 'live' ? 'Live' : 'Idle');
  return (
    <span className={cx(styles.live, styles[state], className)}>
      {children ? <span className={styles.dot} aria-hidden="true" /> : <span className={styles.dot} role="img" aria-label={name} />}
      {children}
    </span>
  );
}
