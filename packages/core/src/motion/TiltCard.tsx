import { useRef, type PointerEvent, type ReactNode } from 'react';
import { useFinePointer, useReducedMotion } from '../hooks/motion';
import styles from './TiltCard.module.scss';

type Props = {
  children: ReactNode;
  /** Small inverse chip in the top-left corner, e.g. "PRJ_01" */
  index?: string;
  className?: string;
  onEnter?: () => void;
};

/**
 * Card with a cursor spotlight and a slight 3D tilt. Its cut corner is lit
 * accent: the card's accent mark.
 */
export function TiltCard({ children, index, className, onEnter }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();

  const onMove = (e: PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    if (fine && !reduced) {
      el.dataset.live = '';
      el.style.setProperty('--rx', `${((0.5 - y) * 5).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((x - 0.5) * 6).toFixed(2)}deg`);
    }
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    delete el.dataset.live;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--my', '-40%');
  };

  return (
    <div className={styles.frame}>
      <div
        ref={ref}
        className={[styles.card, className].filter(Boolean).join(' ')}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerEnter={onEnter}
      >
        {index && <span className={styles.index}>{index}</span>}
        {children}
      </div>
    </div>
  );
}
