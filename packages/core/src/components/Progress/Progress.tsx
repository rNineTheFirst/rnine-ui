import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Progress.module.scss';

type Props = {
  /** What is progressing (visible, and the bar's accessible name). */
  label: ReactNode;
  /** 0 to max. Leave out for an unknown duration (an indeterminate bar). */
  value?: number;
  max?: number;
  /** Text on the right, e.g. "68%" or "3 of 5". Defaults to the percentage. */
  valueText?: string;
  className?: string;
};

/** A progress bar. Accent element: the fill. */
export function Progress({ label, value, max = 100, valueText, className }: Props) {
  const known = typeof value === 'number';
  const pct = known ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const text = valueText ?? (known ? `${Math.round(pct)}%` : undefined);
  return (
    <div className={cx(styles.progress, className)}>
      <div className={styles.head}>
        <span>{label}</span>
        {text && <span className={styles.value}>{text}</span>}
      </div>
      <div
        className={cx(styles.bar, !known && styles.indeterminate)}
        role="progressbar"
        aria-label={typeof label === 'string' ? label : undefined}
        aria-valuemin={known ? 0 : undefined}
        aria-valuemax={known ? max : undefined}
        aria-valuenow={known ? value : undefined}
        aria-valuetext={text}
      >
        <span className={styles.fill} style={known ? { width: `${pct}%` } : undefined} />
      </div>
    </div>
  );
}
