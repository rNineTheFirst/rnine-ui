import type { AnchorHTMLAttributes, Ref } from 'react';
import { cx } from '@rnine/core/kit';
import styles from './PenLink.module.scss';

export type PenLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  ref?: Ref<HTMLAnchorElement>;
  /** The page or section this link leads to is the one showing (aria-current="page"); the pen line stays. */
  current?: boolean;
};

/**
 * A text link that a pen underlines: on hover or keyboard focus a stroke of
 * ink draws itself under it, left to right, and ends in a drop. For
 * navigation and lists of titles. Accent element: the pen line.
 */
export function PenLink({ current, className, ref, ...rest }: PenLinkProps) {
  return <a {...rest} ref={ref} aria-current={current ? 'page' : rest['aria-current']} className={cx(styles.link, className)} />;
}
