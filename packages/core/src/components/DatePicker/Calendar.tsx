import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from '../../hooks/motion';
import { swapIn as plainSwapIn } from '../../motion/swap';
import { useTheme } from '../../provider/ThemeProvider';
import { cx } from '../../utils/cx';
import { addDays, addMonths, formatDate, isDate, monthStart, monthWeeks, today as todayDate, weekStartOf } from '../../utils/dates';
import styles from './Calendar.module.scss';

export type CalendarProps = {
  /** The picked date (YYYY-MM-DD), or null. */
  value: string | null;
  onSelect: (date: string) => void;
  /** Earliest date that can be picked. */
  min?: string;
  /** Latest date that can be picked. */
  max?: string;
  /** Days that can't be picked (a holiday, a full day). */
  isDateDisabled?: (date: string) => boolean;
  /** Days that can be picked look open (filled, with a dot): for availability, where most days are closed. */
  availability?: boolean;
  locale?: string;
  /** 0 = Sunday … 6 = Saturday. Default: the locale's. */
  weekStart?: number;
  /** Default: today in the browser's zone (set it for stories and tests). */
  today?: string;
  /** Name of the month grid for screen readers, before the month: "Delivery date, November 2026". */
  label?: string;
  /** Moves focus to the picked (or first) day on mount: for popovers. */
  autoFocus?: boolean;
  className?: string;
};

/**
 * A month of days to pick from: arrows move a day or a week, Home/End go to
 * the week's ends, PageUp/PageDown change the month (with Shift, the year).
 * Closed days can still be reached (and are read as unavailable). The month's
 * name enters with the library's TextReveal and the days with its swap. Used
 * by DatePicker and DateTimePicker.
 */
export function Calendar({ value, onSelect, min, max, isDateDisabled, availability, locale, weekStart, today: todayProp, label, autoFocus, className }: CalendarProps) {
  const { slots } = useTheme();
  const { TextReveal } = slots;
  const reduced = useReducedMotion();
  const titleId = useId();
  const now = useMemo(() => todayProp ?? todayDate(), [todayProp]);
  const start = weekStart ?? weekStartOf(locale);
  const clamp = (d: string) => (min && d < min ? min : max && d > max ? max : d);
  const [focus, setFocus] = useState(() => clamp(isDate(value) ? value : now));
  const view = monthStart(focus);
  const gridRef = useRef<HTMLTableElement>(null);
  // Focus follows the roving day only after the keyboard or the month buttons moved it
  const moved = useRef(autoFocus ?? false);
  const shownView = useRef(view);

  // A value picked elsewhere (the other half of a DateTimePicker, a reset) brings its month
  const [seen, setSeen] = useState(value);
  if (seen !== value) {
    setSeen(value);
    if (isDate(value)) setFocus(value);
  }

  useEffect(() => {
    if (moved.current) {
      moved.current = false;
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focus}"]`)?.focus();
    }
    if (shownView.current !== view) {
      shownView.current = view;
      if (!reduced && gridRef.current) (slots.swapIn ?? plainSwapIn)(gridRef.current);
    }
  }, [focus, view, reduced, slots]);

  const disabled = (d: string) => (!!min && d < min) || (!!max && d > max) || !!isDateDisabled?.(d);
  const move = (d: string) => {
    moved.current = true;
    setFocus(clamp(d));
  };

  const onKey = (e: KeyboardEvent<HTMLTableElement>) => {
    const steps: Record<string, () => string> = {
      ArrowLeft: () => addDays(focus, -1),
      ArrowRight: () => addDays(focus, 1),
      ArrowUp: () => addDays(focus, -7),
      ArrowDown: () => addDays(focus, 7),
      Home: () => addDays(focus, -((new Date(`${focus}T00:00:00Z`).getUTCDay() - start + 7) % 7)),
      End: () => addDays(focus, 6 - ((new Date(`${focus}T00:00:00Z`).getUTCDay() - start + 7) % 7)),
      PageUp: () => addMonths(focus, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focus, e.shiftKey ? 12 : 1),
    };
    const next = steps[e.key];
    if (!next) return;
    e.preventDefault();
    move(next());
  };

  const prevMonth = addDays(view, -1);
  const nextMonth = addMonths(view, 1);
  const weeks = monthWeeks(view, start);
  const title = formatDate(view, locale, { month: 'long', year: 'numeric' });
  const long = (d: string) => formatDate(d, locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className={cx(styles.calendar, availability && styles.availability, className)} data-part="calendar">
      <div className={styles.head}>
        <button
          type="button"
          className={styles.nav}
          aria-label="Previous month"
          disabled={!!min && prevMonth < min}
          onClick={() => {
            moved.current = false;
            setFocus(clamp(addMonths(focus, -1)));
          }}
        >
          <ChevronLeft strokeWidth={1.5} aria-hidden="true" />
        </button>
        <div id={titleId} className={styles.title} aria-live="polite" data-part="month">
          <TextReveal key={view} text={title} trigger="mount" duration={450} />
        </div>
        <button
          type="button"
          className={styles.nav}
          aria-label="Next month"
          disabled={!!max && nextMonth > max}
          onClick={() => {
            moved.current = false;
            setFocus(clamp(addMonths(focus, 1)));
          }}
        >
          <ChevronRight strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
      <table ref={gridRef} role="grid" className={styles.grid} aria-label={label ? `${label}, ${title}` : title} onKeyDown={onKey}>
        <thead>
          <tr>
            {weeks[0].map((d) => (
              <th key={d} scope="col" abbr={formatDate(d, locale, { weekday: 'long' })} className={styles.weekday}>
                {formatDate(d, locale, { weekday: 'short' })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((d) => {
                const inMonth = monthStart(d) === view;
                const off = disabled(d);
                const picked = d === value;
                return (
                  <td key={d} aria-selected={inMonth ? picked : undefined} className={styles.cell}>
                    {inMonth && (
                      <button
                        type="button"
                        data-date={d}
                        data-part="day"
                        className={cx(styles.day, !off && styles.open, picked && styles.picked, d === now && styles.today)}
                        tabIndex={d === focus ? 0 : -1}
                        aria-label={off ? `${long(d)}, unavailable` : long(d)}
                        aria-disabled={off || undefined}
                        aria-current={d === now ? 'date' : undefined}
                        onClick={() => {
                          setFocus(d);
                          if (!off) onSelect(d);
                        }}
                      >
                        {formatDate(d, locale, { day: 'numeric' })}
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
