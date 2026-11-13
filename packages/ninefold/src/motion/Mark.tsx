import { useId, useLayoutEffect, useRef } from 'react';
import { cx } from '@rnine/core/kit';
import { useReducedMotion } from '@rnine/core/motion';
import { useMark, type MarkProps } from '@rnine/core';
import { useNight } from '../fx/useNight';
import { ART, GRAIN_PX, RING, SHEEN, SMALL_PX, WAX, artAt, parseMark } from './seal';
import styles from './Mark.module.scss';

/** The stamp pressing into the wax: in deep, a little spring back, at rest. */
const PRESS: Keyframe[] = [{ transform: 'scale(1)' }, { transform: 'scale(0.92)', offset: 0.35 }, { transform: 'scale(1.015)', offset: 0.7 }, { transform: 'scale(1)' }];
/** The first press: the impression isn't there until the stamp meets the wax. */
const FIRST_PRESS: Keyframe[] = [{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'scale(0.92)', offset: 0.3 }, { transform: 'scale(1.015)', offset: 0.7 }, { opacity: 1, transform: 'scale(1)' }];

/**
 * The app's mark (ThemeProvider mark, or MarkProvider) pressed into a seal of
 * poured wax: a raised lip with a sheen, a pressed well, the mark pressed in
 * with a lit edge; at night two fireflies circle it. The wax never moves: only
 * the stamp does. On hover the mark is pressed in again (deeper, then back,
 * then a foil glint); on mount the wax is already poured and the mark is
 * stamped into it; or never (animate). At 40px and below (or
 * variant="simplified") it's the small seal: no gloss, and the mark's
 * simplified version, smaller and lighter, so it stays readable.
 */
export function Mark({ size = 32, variant = 'full', animate = 'hover', label, className }: MarkProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  // The impression (the well, then the mark with its lit edge): what the stamp moves
  const wellRef = useRef<SVGGElement>(null);
  const stampRef = useRef<SVGGElement>(null);
  const foilRef = useRef<SVGRectElement>(null);
  const night = useNight(ref);
  const id = useId().replace(/:/g, '');
  const px = typeof size === 'number' ? size : null;
  const small = variant === 'simplified' || (px !== null && px <= SMALL_PX);
  const artwork = useMark();
  const art = parseMark(small ? (artwork.simplified ?? artwork.full) : artwork.full);
  const box = small ? ART.small : ART.large;
  const at = artAt(box.size);
  const pressed = (className: string, shift: number) => (
    <svg x={at + shift} y={at + shift} width={box.size} height={box.size} viewBox={art.viewBox} className={className}>
      {art.paths.map((d) => <path key={d.slice(0, 24)} d={d} />)}
    </svg>
  );

  const impression = () => [wellRef.current, stampRef.current].filter((el): el is SVGGElement => typeof el?.animate === 'function');

  const glint = (delay: number) =>
    foilRef.current?.animate?.([{ opacity: 0, translate: '0px 0px' }, { opacity: 1, offset: 0.2 }, { opacity: 0, translate: '150px 0px' }], { duration: 900, delay, easing: 'ease-in-out' });

  const press = () => {
    const parts = impression();
    if (reduced || !parts.length) return;
    parts.forEach((el) => el.animate(PRESS, { duration: 520, easing: 'ease-out' }));
    glint(260);
  };

  // On mount the wax is already there; the mark is stamped into it. Started
  // before the first paint, so the mark never shows before it's pressed.
  useLayoutEffect(() => {
    const parts = impression();
    if (animate !== 'mount' || reduced || !parts.length) return;
    const stamped = parts.map((el) => el.animate(FIRST_PRESS, { duration: 620, delay: 300, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'backwards' }));
    const shine = glint(820);
    return () => {
      stamped.forEach((a) => a.cancel());
      shine?.cancel();
    };
    // impression and glint read refs only: once per mount
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
      <span className={styles.seal}>
        <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id={`${id}w`} cx="38%" cy="32%" r="75%">
              <stop offset="0" className={styles.waxLight} />
              <stop offset="0.45" className={styles.wax} />
              <stop offset="1" className={styles.waxDark} />
            </radialGradient>
            {!small && (
              <>
                <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" className={styles.bevelShade} />
                  <stop offset="0.5" className={styles.bevelClear} />
                  <stop offset="1" className={styles.bevelLit} />
                </linearGradient>
                <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" className={styles.lipLit} />
                  <stop offset="0.45" className={styles.lipClear} />
                </linearGradient>
                <clipPath id={`${id}e`}><path d={WAX} /></clipPath>
                <filter id={`${id}g`} x="0" y="0" width="100%" height="100%">
                  <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves={2} seed={7} />
                  <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
                </filter>
                <filter id={`${id}s`}><feGaussianBlur stdDeviation="2.2" /></filter>
              </>
            )}
          </defs>
          <path d={WAX} fill={`url(#${id}w)`} />
          {small ? (
            <g ref={stampRef} className={styles.stamp}>
              <circle cx="50" cy="50" r={RING} className={styles.well} />
              <circle cx="50" cy="50" r={RING} className={styles.ring} />
              {pressed(styles.light, 0)}
            </g>
          ) : (
            <>
              <path d={WAX} fill="none" stroke={`url(#${id}l)`} strokeWidth="5" clipPath={`url(#${id}e)`} />
              <g ref={wellRef} className={styles.stamp}>
                <circle cx="50" cy="50" r={RING} className={styles.wellPoured} />
                <circle cx="50" cy="50" r={RING} fill="none" stroke={`url(#${id}b)`} strokeWidth="2.6" />
              </g>
              <ellipse
                cx={SHEEN.cx} cy={SHEEN.cy} rx={SHEEN.rx} ry={SHEEN.ry}
                transform={`rotate(${SHEEN.rotate} ${SHEEN.cx} ${SHEEN.cy})`}
                filter={`url(#${id}s)`} className={styles.sheen}
              />
              {(px === null || px >= GRAIN_PX) && <rect width="100" height="100" filter={`url(#${id}g)`} clipPath={`url(#${id}e)`} className={styles.grain} />}
              <g ref={stampRef} className={styles.stamp}>
                {pressed(styles.lit, box.lit)}
                {pressed(styles.art, 0)}
              </g>
            </>
          )}
        </svg>
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
      {!small && night && (
        <svg className={styles.flies} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <g className={styles.orbit}><circle cx="50" cy="1" r="2.2" /></g>
          <g className={styles.orbitBack}><circle cx="99" cy="50" r="1.7" /></g>
        </svg>
      )}
    </span>
  );
}
