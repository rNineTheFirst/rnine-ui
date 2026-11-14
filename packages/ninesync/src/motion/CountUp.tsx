import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@rnine/core/motion';
import styles from './CountUp.module.scss';

type Props = {
  /** The number to show. */
  value: number;
  /** How to write it: an Intl.NumberFormat or a function. Default: whole numbers with grouping. */
  format?: Intl.NumberFormat | ((n: number) => string);
  /** Count from 0 when it first appears (in ms). Default 700. */
  duration?: number;
  /** Tick from the old value when it changes (in ms). Default 420. */
  changeDuration?: number;
  className?: string;
};

const PLAIN = new Intl.NumberFormat();
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * A number that counts: up from zero when it first appears (700ms, easing
 * out), then from the old value to the new one when it changes (420ms). Use
 * it as a StatTile value. Screen readers get the final number; with reduced
 * motion it just shows.
 */
export function CountUp({ value, format = PLAIN, duration = 700, changeDuration = 420, className }: Props) {
  const reduced = useReducedMotion();
  const write = (n: number) => (typeof format === 'function' ? format(n) : format.format(n));
  // Whole-number targets count in whole numbers
  const step = (n: number) => (Number.isInteger(value) ? Math.round(n) : n);
  const [counted, setCounted] = useState(0);
  const from = useRef<number | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) {
      from.current = value;
      return;
    }
    const first = from.current === null;
    const start = first ? 0 : from.current!;
    const length = first ? duration : changeDuration;
    let frame = 0;
    let begun = 0;
    const tick = (now: number) => {
      begun ||= now;
      const t = Math.min(1, (now - begun) / length);
      setCounted(start + (value - start) * easeOut(t));
      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    };
    const go = () => {
      frame = requestAnimationFrame(tick);
    };
    // The first count waits until the number is on screen
    const el = ref.current;
    if (first && el && typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          go();
        }
      });
      io.observe(el);
      return () => {
        io.disconnect();
        cancelAnimationFrame(frame);
        from.current ??= value;
      };
    }
    go();
    return () => {
      cancelAnimationFrame(frame);
      from.current = value;
    };
  }, [value, reduced, duration, changeDuration]);

  const shown = reduced ? value : counted;
  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{write(step(shown))}</span>
      <span className={styles.sr}>{write(value)}</span>
    </span>
  );
}
