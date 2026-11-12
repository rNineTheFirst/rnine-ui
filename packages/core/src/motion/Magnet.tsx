import { useEffect, useRef, type ReactNode } from 'react';
import { useFinePointer, useReducedMotion } from '../hooks/motion';
import styles from './Magnet.module.scss';

type Props = { children: ReactNode; strength?: number; reach?: number; max?: number };

/** Leans its child toward the pointer when the pointer gets close. */
export function Magnet({ children, strength = 0.28, reach = 50, max = 9 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !fine) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const near =
        e.clientX > r.left - reach && e.clientX < r.right + reach && e.clientY > r.top - reach && e.clientY < r.bottom + reach;
      if (near) {
        const clamp = (v: number) => Math.max(-max, Math.min(max, v));
        const dx = clamp((e.clientX - (r.left + r.width / 2)) * strength);
        const dy = clamp((e.clientY - (r.top + r.height / 2)) * strength);
        el.dataset.live = '';
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      } else if ('live' in el.dataset) {
        delete el.dataset.live;
        el.style.transform = '';
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      el.style.transform = '';
    };
  }, [reduced, fine, strength, reach, max]);

  return (
    <span ref={ref} className={styles.magnet}>
      {children}
    </span>
  );
}
