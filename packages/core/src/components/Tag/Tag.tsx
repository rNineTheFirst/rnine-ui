import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Tag.module.scss';

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  /** inverse: solid text-colored chip, for emphasis. */
  inverse?: boolean;
};

/** A small label (technology, topic). Accent element: the square bullet. */
export function Tag({ children, inverse, className, ...rest }: TagProps) {
  return (
    <span {...rest} className={cx(styles.tag, inverse && styles.inverse, className)}>
      {children}
    </span>
  );
}

export type StatusTone = 'live' | 'success' | 'warning' | 'danger' | 'idle';

type StatusProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  /** live: cyan, pulsing (something is running right now). */
  tone?: StatusTone;
};

/**
 * A state with a word and a dot ("Live", "Deploying"). The word is required:
 * state is never shown by color alone. Lives inside components that carry
 * their own accent (cards, rows), so it has none.
 */
export function Status({ children, tone = 'live', className, ...rest }: StatusProps) {
  return (
    <span {...rest} className={cx(styles.status, styles[tone], className)}>
      {children}
    </span>
  );
}
