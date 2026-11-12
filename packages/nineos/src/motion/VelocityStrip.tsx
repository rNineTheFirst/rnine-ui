import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@rnine/core/motion';
import styles from './VelocityStrip.module.scss';

type Props = { items: string[]; label: string };

/** A line of words that drifts, speeds up with scrolling and follows its direction. */
export function VelocityStrip({ items, label }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = track.current;
    if (!el || reduced) return;
    let offset = 0;
    let velocity = 0;
    let direction = 1;
    let lastY = window.scrollY;
    let raf = 0;

    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (dy) direction = dy > 0 ? 1 : -1;
      velocity = Math.min(40, velocity + Math.abs(dy) * 0.6);
    };
    const loop = () => {
      velocity *= 0.92;
      offset -= (0.35 + velocity * 0.25) * direction;
      const third = el.scrollWidth / 3;
      if (offset < -third) offset += third;
      if (offset > 0) offset -= third;
      el.style.transform = `translateX(${offset.toFixed(1)}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      el.style.transform = '';
    };
  }, [reduced]);

  const run = items.flatMap((w) => [w, '/']);
  return (
    <div className={styles.strip} aria-label={label} role="note">
      <div ref={track} className={styles.track} aria-hidden="true">
        {[0, 1, 2].flatMap((copy) =>
          run.map((w, i) =>
            w === '/' ? (
              <i key={`${copy}-${i}`}>/</i>
            ) : (
              <span key={`${copy}-${i}`}>{w}</span>
            ),
          ),
        )}
      </div>
      <span className={styles.sr}>{items.join(', ')}</span>
    </div>
  );
}
