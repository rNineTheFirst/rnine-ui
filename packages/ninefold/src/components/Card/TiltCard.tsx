import { useRef, type PointerEvent, type ReactNode } from 'react';
import { cx, useCardLift } from '@rnine/core/kit';
import styles from './Card.module.scss';

type Props = {
  children: ReactNode;
  /** Small inverse chip in the top-left corner, e.g. "No. 1" */
  index?: string;
  className?: string;
  onEnter?: () => void;
};

/**
 * A card with a folded top-right corner that lifts toward the pointer (it
 * starts lifting 450px away and opens from 26px to 60px; a tap lifts it on
 * touch), and a warm light that follows the pointer across it. Accent
 * element: the fold's lining.
 */
export function TiltCard({ children, index, className, onEnter }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useCardLift(ref);

  const onMove = (e: PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  };

  return (
    <div className={styles.frame}>
      <div ref={ref} className={cx(styles.card, styles.lit, className)} data-r9-card="" onPointerMove={onMove} onPointerEnter={onEnter}>
        <span className={styles.fold} aria-hidden="true" />
        {index && <span className={styles.index}>{index}</span>}
        {children}
      </div>
    </div>
  );
}
