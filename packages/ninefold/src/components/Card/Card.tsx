import type { ReactNode } from 'react';
import { cx } from '@rnine/core/kit';
import { TiltCard } from './TiltCard';
import styles from './Card.module.scss';

type Props = {
  children: ReactNode;
  /** Small inverse chip in the top-left corner, e.g. "No. 1". */
  index?: string;
  /** The corner lifts toward the pointer and a warm light follows it (mouse; a tap lifts it on touch). Default on. */
  interactive?: boolean;
  /** Makes the whole card a link. Put the card's title text in `label` for screen readers. */
  href?: string;
  /** Accessible name when the card is a link. */
  label?: string;
  className?: string;
  onPointerEnter?: () => void;
};

/**
 * A card of raised paper with its top-right corner folded over (the fold's
 * lining is the card's accent element). Interactive cards lift the fold
 * toward the pointer.
 */
export function Card({ children, index, interactive = true, href, label, className, onPointerEnter }: Props) {
  const body = (
    <>
      {href && <a className={styles.cover} href={href} aria-label={label} />}
      {children}
    </>
  );

  if (interactive) {
    return (
      <TiltCard index={index} className={cx(href && styles.linked, className)} onEnter={onPointerEnter}>
        {body}
      </TiltCard>
    );
  }
  return (
    <div className={cx(styles.card, href && styles.linked, className)} data-r9-card="" onPointerEnter={onPointerEnter}>
      <span className={styles.fold} aria-hidden="true" />
      {index && <span className={styles.index}>{index}</span>}
      {body}
    </div>
  );
}
