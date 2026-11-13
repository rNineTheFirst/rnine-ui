import { useEffect, useId, useRef } from 'react';
import { cx, MarkArt } from '@rnine/core/kit';
import { useReducedMotion } from '@rnine/core/motion';
import type { MarkProps } from '@rnine/core';
import { useNight } from '../fx/useNight';
import { BRANCHES, LEAF, LEAF_STOPS, RING, WAX, leafTransform } from './seal';
import styles from './Mark.module.scss';

/** Sprig sway on a press, in degrees (tuned). */
const SWAY = 8;

/** A sprig branch from the seal's center: a stem and four leaves, alternating sides. */
function Branch({ rotate, length }: { rotate: number; length: number }) {
  return (
    <g transform={`rotate(${rotate} 50 50)`}>
      <g className={styles.branch}>
        <path className={styles.stem} d={`M50 50L${50 - length} 50`} />
        {LEAF_STOPS.map((t, i) => (
          <path key={t} d={LEAF} transform={leafTransform(length, t, i)} />
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
          {BRANCHES.map((b) => <Branch key={b.rotate} {...b} />)}
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
          {full && <circle cx="50" cy="50" r={RING} className={styles.press} />}
          {full && <circle cx="50" cy="50" r={RING} className={styles.ring} />}
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
