import type { CSSProperties } from 'react';
import { cx } from '../../utils/cx';
import styles from './Skeleton.module.scss';

type Props = {
  /** text: lines of text; block: an image or card; circle: an avatar. */
  shape?: 'text' | 'block' | 'circle';
  /** Number of text lines (the last one is shorter). */
  lines?: number;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  className?: string;
};

/**
 * Placeholder while content loads. Hidden from screen readers: mark the
 * loading region with aria-busy instead. Accent element: the faint accent
 * light that sweeps across.
 */
export function Skeleton({ shape = 'text', lines = 3, width, height, className }: Props) {
  if (shape === 'text') {
    return (
      <span className={cx(styles.lines, className)} style={{ width }} aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className={styles.line} style={i === lines - 1 && lines > 1 ? { width: '62%' } : undefined} />
        ))}
      </span>
    );
  }
  return <span className={cx(styles.bone, styles[shape], className)} style={{ width, height }} aria-hidden="true" />;
}
