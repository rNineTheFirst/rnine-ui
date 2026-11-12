import { useEffect, useState } from 'react';
import { cx, MarkArt } from '@rnine/core/kit';
import { useReducedMotion } from '@rnine/core/motion';
import type { MarkProps } from '@rnine/core';
import styles from './Monogram.module.scss';

/**
 * The app's mark (ThemeProvider mark, or MarkProvider), with the NineOS slice
 * glitch in cyan and magenta (animate: on hover, on mount, or never). Until an
 * app provides one it shows a placeholder frame.
 */
export function Mark({ size = 32, variant = 'full', animate = 'hover', label, className }: MarkProps) {
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (animate !== 'mount' || reduced) return;
    const t = window.setTimeout(() => setRun((n) => n + 1), 400);
    return () => window.clearTimeout(t);
  }, [animate, reduced]);

  const play = () => {
    if (animate !== 'none' && !reduced) setRun((n) => n + 1);
  };

  return (
    <span
      className={cx(styles.mono, className)}
      style={{ width: size, height: size }}
      onMouseEnter={play}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <MarkArt variant={variant} />
      {run > 0 && (
        <span key={run} className={styles.ghosts}>
          <span className={styles.g1}><MarkArt variant={variant} /></span>
          <span className={styles.g2}><MarkArt variant={variant} /></span>
        </span>
      )}
    </span>
  );
}
