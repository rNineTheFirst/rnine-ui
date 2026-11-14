import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { rippleAt } from '../../motion/ripple';
import { cx } from '../../utils/cx';
import { formatTime, fromMinutes, hourCycleOf, minutes, type HourCycle } from '../../utils/dates';
import styles from './TimePicker.module.scss';

export type TimeListProps = {
  /** The times to show, HH:mm, in order. */
  times: string[];
  value: string | null;
  onSelect: (time: string) => void;
  isTimeDisabled?: (time: string) => boolean;
  locale?: string;
  hourCycle?: HourCycle;
  /** Minutes each time lasts: shows when it ends ("to 10:30"). */
  duration?: number;
  /** The group's name for screen readers: "Times on Mon 16 Nov". */
  label: string;
  /** list: one column (a side column, a popover). grid: as many columns as fit. */
  layout?: 'list' | 'grid';
  /** Moves focus to the picked (or first) time on mount: for popovers. */
  autoFocus?: boolean;
  /** Shown when there are no times. */
  empty?: ReactNode;
  className?: string;
};

/**
 * Times to pick from, as buttons: arrows move between them, Home/End to the
 * ends, Enter or Space picks. A pick sends a ripple through the backdrop
 * (where the library has one). Accent element: the picked time.
 */
export function TimeList({ times, value, onSelect, isTimeDisabled, locale, hourCycle, duration, label, layout = 'list', autoFocus, empty, className }: TimeListProps) {
  const cycle = hourCycle ?? hourCycleOf(locale);
  const listRef = useRef<HTMLDivElement>(null);
  const start = Math.max(0, value ? times.indexOf(value) : 0);
  const [focus, setFocus] = useState(start);
  const at = Math.min(focus, Math.max(0, times.length - 1));
  const moved = useRef(autoFocus ?? false);

  // A new list (another day) starts from its picked time, else the top
  const key = `${times.join(',')}|${value ?? ''}`;
  const [seen, setSeen] = useState(key);
  if (seen !== key) {
    setSeen(key);
    setFocus(Math.max(0, value ? times.indexOf(value) : 0));
  }

  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    const el = listRef.current?.querySelector<HTMLButtonElement>(`[data-index="${at}"]`);
    el?.focus();
    el?.scrollIntoView?.({ block: 'nearest' });
  }, [at]);

  if (!times.length) return <div className={cx(styles.empty, className)}>{empty ?? 'No times'}</div>;

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = times.length - 1;
    const next =
      e.key === 'ArrowDown' || e.key === 'ArrowRight' ? Math.min(last, at + 1)
      : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? Math.max(0, at - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    moved.current = true;
    setFocus(next);
    // The same index again still needs focus (e.g. after a click elsewhere)
    if (next === at) listRef.current?.querySelector<HTMLButtonElement>(`[data-index="${at}"]`)?.focus();
  };

  return (
    <div ref={listRef} role="group" aria-label={label} className={cx(styles.list, layout === 'grid' && styles.grid, className)} onKeyDown={onKey} data-part="times">
      {times.map((t, i) => {
        const off = !!isTimeDisabled?.(t);
        const picked = t === value;
        const text = formatTime(t, locale, cycle);
        const end = duration ? formatTime(fromMinutes(minutes(t) + duration), locale, cycle) : null;
        return (
          <button
            key={t}
            type="button"
            data-index={i}
            data-part="time"
            className={cx(styles.time, picked && styles.picked)}
            tabIndex={i === at ? 0 : -1}
            aria-pressed={picked}
            aria-disabled={off || undefined}
            aria-label={end ? `${text} to ${end}${off ? ', unavailable' : ''}` : off ? `${text}, unavailable` : undefined}
            onFocus={() => setFocus(i)}
            onClick={(e) => {
              if (off) return;
              const r = e.currentTarget.getBoundingClientRect();
              rippleAt(r.left + r.width / 2, r.top);
              onSelect(t);
            }}
          >
            <span>{text}</span>
            {end && layout === 'list' && <span className={styles.end}>to {end}</span>}
          </button>
        );
      })}
    </div>
  );
}
