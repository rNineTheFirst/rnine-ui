import type { ReactNode } from 'react';
import { TiltCard } from '../../motion/TiltCard';
import { cx } from '../../utils/cx';
import styles from './Card.module.scss';

type Props = {
  children: ReactNode;
  /** Small inverse chip in the top-left corner, e.g. "PRJ_01". */
  index?: string;
  /** Cursor spotlight and 3D tilt (mouse only, off with reduced motion). Default on. */
  interactive?: boolean;
  /** Makes the whole card a link. Put the card's title text in `label` for screen readers. */
  href?: string;
  /** Accessible name when the card is a link. */
  label?: string;
  className?: string;
  onPointerEnter?: () => void;
};

/**
 * A card with the library's corner on its top right, and the corner ornament there (the card's accent mark).
 * Interactive cards follow the pointer with a cyan spotlight and a slight tilt.
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
    <div className={cx(styles.card, href && styles.linked, className)} onPointerEnter={onPointerEnter}>
      {index && <span className={styles.index}>{index}</span>}
      {body}
    </div>
  );
}
