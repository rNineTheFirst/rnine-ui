import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Tabs.module.scss';

export type TabItem = { id: string; label: ReactNode; content: ReactNode; disabled?: boolean };

type Props = {
  items: TabItem[];
  /** Accessible name for the tab list. */
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
};

/**
 * Tabs with full keyboard support (arrow keys, Home, End). Accent element:
 * the selected tab's underline.
 */
export function Tabs({ items, label, value, defaultValue, onChange, className }: Props) {
  const base = useId();
  const [inner, setInner] = useState(defaultValue ?? items[0]?.id);
  const selected = value ?? inner;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (id: string) => {
    if (value === undefined) setInner(id);
    onChange?.(id);
  };

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const enabled = items.map((t, i) => (t.disabled ? -1 : i)).filter((i) => i >= 0);
    const pos = enabled.indexOf(index);
    let next: number | undefined;
    if (e.key === 'ArrowRight') next = enabled[(pos + 1) % enabled.length];
    else if (e.key === 'ArrowLeft') next = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    if (next === undefined) return;
    e.preventDefault();
    refs.current[next]?.focus();
    select(items[next].id);
  };

  return (
    <div className={cx(styles.tabs, className)}>
      <div role="tablist" aria-label={label} className={styles.list}>
        {items.map((t, i) => {
          const isSelected = t.id === selected;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={isSelected}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={isSelected ? 0 : -1}
              disabled={t.disabled}
              className={styles.tab}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {items.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={t.id !== selected}
          tabIndex={0}
          className={styles.panel}
        >
          {t.id === selected && t.content}
        </div>
      ))}
    </div>
  );
}
