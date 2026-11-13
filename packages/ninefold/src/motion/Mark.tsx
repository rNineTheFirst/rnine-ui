import { useEffect, useId, useRef } from 'react';
import { cx, MarkArt } from '@rnine/core/kit';
import { useReducedMotion } from '@rnine/core/motion';
import type { MarkProps } from '@rnine/core';
import { useNight } from '../fx/useNight';
import styles from './Mark.module.scss';

/** The seal's outline: a disc of wax with a soft, uneven edge (seeded, the same every time). */
const WAX =
  'M96 50C96.6 53.1 96.7 56.7 95.9 59.7C95 62.8 92.3 65.4 90.7 68.1C89 70.8 87.8 73.7 85.9 76.1C84 78.5 81.4 80.1 79.2 82.5C77.1 84.8 75.7 88.3 73.2 90.1C70.7 92 67.3 93.3 64.2 93.8C61.1 94.3 57.7 93.1 54.5 93.2C51.4 93.3 48.4 94.5 45.3 94.4C42.3 94.3 39.3 93.2 36.2 92.6C33 91.9 29.2 92.1 26.6 90.6C23.9 89 22 85.7 20.2 83.1C18.3 80.5 17.6 77.5 15.5 75.1C13.4 72.7 9.5 71.4 7.8 68.8C6.2 66.2 6.1 62.6 5.6 59.4C5.1 56.3 4.4 53.1 4.7 50C5 46.9 6.7 44 7.4 40.9C8.2 37.9 8.4 34.9 9.2 31.8C10 28.7 10.2 24.9 12 22.4C13.7 19.8 17.1 18.2 19.8 16.4C22.5 14.7 25.4 13.5 28.2 12.2C30.9 10.8 33.5 9.3 36.4 8.1C39.2 6.9 42.2 5.9 45.3 5.2C48.4 4.4 51.9 3 54.9 3.6C57.9 4.2 60.5 7.4 63.4 8.8C66.3 10.1 69.4 10.3 72.2 11.5C75.1 12.8 77.9 14.4 80.4 16.2C82.9 18.1 85.4 20.4 87.3 22.9C89.2 25.4 90.8 28.4 91.6 31.5C92.4 34.5 91.3 38 92 41.1C92.7 44.2 95.3 46.9 96 50Z';
const LEAF = 'M0 0Q6 -5 13 0Q6 5 0 0Z';
/** Sprig sway on a press, in degrees (tuned). */
const SWAY = 8;

/** A sprig branch from the seal's center: a stem and four leaves, alternating sides. */
function Branch({ rotate, length }: { rotate: number; length: number }) {
  return (
    <g transform={`rotate(${rotate} 50 50)`}>
      <g className={styles.branch}>
        <path className={styles.stem} d={`M50 50L${50 - length} 50`} />
        {[0.42, 0.62, 0.8, 0.96].map((t, i) => (
          <path key={t} d={LEAF} transform={`translate(${(50 - length * t).toFixed(1)} 50) rotate(${180 + (i % 2 ? 1 : -1) * 42}) scale(${(1 - t * 0.35).toFixed(2)})`} />
        ))}
      </g>
    </g>
  );
}

/**
 * The app's mark (ThemeProvider mark, or MarkProvider) pressed into a wax
 * seal, with a sprig tucked behind it; at night two fireflies circle it.
 * The seal presses again (a squash, a foil glint, the sprig sways) on
 * hover, drops and presses on mount, or never (animate). The simplified
 * variant, for 24px and below, is the seal alone.
 */
export function Mark({ size = 32, variant = 'full', animate = 'hover', label, className }: MarkProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const sealRef = useRef<HTMLSpanElement>(null);
  const foilRef = useRef<SVGRectElement>(null);
  const backRef = useRef<SVGSVGElement>(null);
  const night = useNight(ref);
  const id = useId().replace(/:/g, '');
  const full = variant === 'full';

  const press = () => {
    const seal = sealRef.current;
    if (reduced || !seal || typeof seal.animate !== 'function') return;
    seal.animate([{ scale: 1 }, { scale: 0.9, offset: 0.3 }, { scale: 1.04, offset: 0.65 }, { scale: 1 }], { duration: 520, easing: 'ease-out' });
    foilRef.current?.animate?.([{ opacity: 0, translate: '0px 0px' }, { opacity: 1, offset: 0.2 }, { opacity: 0, translate: '150px 0px' }], { duration: 900, delay: 260, easing: 'ease-in-out' });
    backRef.current?.querySelectorAll(`.${styles.branch}`).forEach((b, i) => {
      const s = i ? -SWAY : SWAY;
      (b as SVGGElement).animate?.([{ rotate: '0deg' }, { rotate: `${s}deg`, offset: 0.3 }, { rotate: `${-s * 0.55}deg`, offset: 0.65 }, { rotate: '0deg' }], { duration: 1100, easing: 'ease-out' });
    });
  };

  useEffect(() => {
    const seal = sealRef.current;
    if (animate !== 'mount' || reduced || !seal || typeof seal.animate !== 'function') return;
    // The wax drops onto the page, then the seal is pressed
    const drop = seal.animate(
      [{ scale: 0.2, opacity: 0, translate: '0 -18%' }, { scale: 1.1, opacity: 1, translate: '0 0', offset: 0.55 }, { scale: 0.94, offset: 0.78 }, { scale: 1 }],
      { duration: 900, delay: 300, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'backwards' },
    );
    const t = window.setTimeout(press, 1250);
    return () => {
      drop.cancel();
      window.clearTimeout(t);
    };
    // press reads refs only; run once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, reduced]);

  return (
    <span
      ref={ref}
      className={cx(styles.mark, className)}
      style={{ width: size, height: size }}
      onMouseEnter={animate !== 'none' ? press : undefined}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {full && (
        <svg ref={backRef} className={styles.back} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <Branch rotate={-38} length={50} />
          <Branch rotate={150} length={46} />
        </svg>
      )}
      <span ref={sealRef} className={styles.seal}>
        <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id={`${id}w`} cx="38%" cy="32%" r="75%">
              <stop offset="0" className={styles.waxLight} />
              <stop offset="0.45" className={styles.wax} />
              <stop offset="1" className={styles.waxDark} />
            </radialGradient>
          </defs>
          <path d={WAX} fill={`url(#${id}w)`} />
          {full && <circle cx="50" cy="50" r="31.5" className={styles.press} />}
          {full && <circle cx="50" cy="50" r="31.5" className={styles.ring} />}
        </svg>
        <span className={styles.highlight}><MarkArt variant={variant} /></span>
        <span className={styles.art}><MarkArt variant={variant} /></span>
        <svg className={styles.glint} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <defs>
            <clipPath id={`${id}c`}><path d={WAX} /></clipPath>
            <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g clipPath={`url(#${id}c)`}>
            <rect ref={foilRef} className={styles.foil} x="-40" y="-10" width="34" height="120" fill={`url(#${id}f)`} transform="skewX(-18)" />
          </g>
        </svg>
      </span>
      {full && night && (
        <svg className={styles.flies} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <g className={styles.orbit}><circle cx="50" cy="1" r="2.2" /></g>
          <g className={styles.orbitBack}><circle cx="99" cy="50" r="1.7" /></g>
        </svg>
      )}
    </span>
  );
}
