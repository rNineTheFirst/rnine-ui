import type { ReactNode } from 'react';
import { cx } from '@rnine/core/kit';
import styles from './ChipBar.module.scss';

export type ChipItem = { key: string; label: ReactNode; /** e.g. "/" before command names, drawn in magenta */ prefix?: string };

type Props = {
  items: ChipItem[];
  onSelect: (key: string) => void;
  /** Accessible name of the group. */
  label: string;
  onPointerDown?: () => void;
  className?: string;
};

/**
 * A row of tap targets (commands, menu entries) that scrolls sideways when it
 * runs out of room. Magenta element: the prefix, and the hover edge.
 */
export function ChipBar({ items, onSelect, label, onPointerDown, className }: Props) {
  return (
    <div role="group" aria-label={label} className={cx(styles.bar, className)} onPointerDown={onPointerDown}>
      {items.map((item) => (
        <button key={item.key} type="button" className={styles.chip} onClick={() => onSelect(item.key)}>
          {item.prefix && <span className={styles.prefix}>{item.prefix}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
}
