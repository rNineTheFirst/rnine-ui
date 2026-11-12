import type { Ref } from 'react';
import { cx } from '../../utils/cx';
import styles from './SegmentedControl.module.scss';

export type SegmentOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the group, e.g. "Mood" or "Navigation mode". */
  label: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
};

/**
 * A small set of mutually exclusive options (CLI | Menu, Light | Dark).
 * Accent element: the selected option's underline.
 */
export function SegmentedControl<T extends string>({ options, value, onChange, label, className, ref }: Props<T>) {
  return (
    <div ref={ref} role="group" aria-label={label} className={cx(styles.group, className)}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} className={styles.option} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
