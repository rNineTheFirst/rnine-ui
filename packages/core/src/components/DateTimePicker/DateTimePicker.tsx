import { useMemo, useState, type ReactNode } from 'react';
import { CalendarClock } from 'lucide-react';
import { useTheme } from '../../provider/ThemeProvider';
import { cx } from '../../utils/cx';
import { addDays, formatDate, formatTime, hourCycleOf, isDate, isTime, offeredTimes, today as todayDate } from '../../utils/dates';
import { Calendar } from '../DatePicker/Calendar';
import type { DateRules } from '../DatePicker/DatePicker';
import { PickerField } from '../DatePicker/PickerField';
import type { FieldOwnProps } from '../Field/FieldFrame';
import { TimeList } from '../TimePicker/TimeList';
import type { TimeRules } from '../TimePicker/TimePicker';
import styles from './DateTimePicker.module.scss';

export type DateTimePickerProps = FieldOwnProps &
  DateRules &
  Omit<TimeRules, 'times' | 'min' | 'max'> & {
    /** The date and time as YYYY-MM-DDTHH:mm, or '' when empty. */
    value: string;
    onChange: (value: string) => void;
    /**
     * The times to offer, HH:mm: the same list every day, or each day's own
     * (open booking times; a day with none can't be picked, and the days
     * that have some look open). Default: every `step` minutes.
     */
    times?: string[] | ((date: string) => string[]);
    /** First time when `times` isn't given, HH:mm. Default 00:00. */
    minTime?: string;
    /** Last time when `times` isn't given, HH:mm. Default 23:59. */
    maxTime?: string;
    /** The calendar and times alone, always open, without the field (side by side when there's room, else stacked). */
    inline?: boolean;
    /** The heading over a day's times. Default "Mon 16 Nov" (and "6 open" for each day's own times). */
    timesTitle?: (date: string, count: number) => ReactNode;
    /** Shown when a day has no times. */
    emptyTimes?: ReactNode;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    /** Adds a hidden input with the value, for forms that submit natively. */
    name?: string;
    id?: string;
  };

const split = (value: string): [string | null, string | null] => {
  const [d, t] = value.split('T');
  return isDate(d) && isTime(t) ? [d, t] : [null, null];
};

/** How far ahead the first pickable day is looked for. */
const LOOKAHEAD = 400;

/**
 * A day from a calendar, then a time from that day's list: inline for
 * booking (the open times of each day), or a field that opens both. Values
 * are YYYY-MM-DDTHH:mm wall-clock strings: no time zones inside (turn
 * instants into the visitor's days and times before, and back after).
 * Picking another day clears the time. Accent element: the picked day and
 * time, and the field's own.
 */
export function DateTimePicker(props: DateTimePickerProps) {
  const { value, onChange, inline, placeholder = 'Pick a date and time', disabled, required, name, id, label, hint, error, hideLabel, className } = props;
  const [date, time] = split(value);
  const cycle = props.hourCycle ?? hourCycleOf(props.locale);
  const field = { label, hint, error, hideLabel, className };
  if (inline) return <Pane {...props} hourCycle={cycle} className={className} />;
  return (
    <PickerField
      {...field}
      id={id}
      display={date && time ? `${formatDate(date, props.locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}, ${formatTime(time, props.locale, cycle)}` : ''}
      placeholder={placeholder}
      icon={<CalendarClock strokeWidth={1.5} />}
      disabled={disabled}
      required={required}
      name={name}
      value={value}
      popLabel={typeof label === 'string' ? label : 'Pick a date and time'}
    >
      {(close) => (
        <Pane
          {...props}
          hourCycle={cycle}
          className={styles.inPopover}
          autoFocus
          onChange={(v) => {
            onChange(v);
            if (v) close();
          }}
        />
      )}
    </PickerField>
  );
}

function Pane({ value, onChange, times, step, minTime, maxTime, isTimeDisabled, duration, locale, hourCycle, min, max, isDateDisabled, weekStart, today, timesTitle, emptyTimes, label, className, autoFocus }: DateTimePickerProps & { autoFocus?: boolean }) {
  const { TextReveal } = useTheme().slots;
  const [date, time] = split(value);
  const perDay = typeof times === 'function';
  const timesFor = (d: string) => (typeof times === 'function' ? times(d) : offeredTimes({ times, step, min: minTime, max: maxTime }));
  const closed = (d: string) => (!!min && d < min) || (!!max && d > max) || !!isDateDisabled?.(d) || (perDay && timesFor(d).length === 0);

  // The day whose times show: the value's, else the first that can be picked
  const first = useMemo(() => {
    let d = today ?? todayDate();
    if (min && d < min) d = min;
    for (let i = 0; i < LOOKAHEAD && !(max && d > max); i++, d = addDays(d, 1)) if (!closed(d)) return d;
    return null;
    // Only where it starts; the rules are read once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [shown, setShown] = useState<string | null>(null);
  const day = shown ?? date ?? first;
  const list = day ? timesFor(day) : [];
  const words = label && typeof label === 'string' ? label : 'Date';

  return (
    <div className={cx(styles.picker, className)} data-part="datetime">
      <div className={styles.layout}>
        <Calendar
          value={day}
          onSelect={(d) => {
            setShown(d);
            if (value && d !== date) onChange('');
          }}
          min={min}
          max={max}
          isDateDisabled={closed}
          availability={perDay}
          locale={locale}
          weekStart={weekStart}
          today={today}
          label={words}
          autoFocus={autoFocus}
          className={styles.calendar}
        />
        <div className={styles.times}>
          {day && (
            <div className={styles.timesHead}>
              {timesTitle ? (
                timesTitle(day, list.length)
              ) : (
                <>
                  <TextReveal key={day} text={formatDate(day, locale, { weekday: 'short', day: 'numeric', month: 'short' })} className={styles.day} trigger="mount" duration={350} />
                  {perDay && <span className={styles.count}>{list.length} open</span>}
                </>
              )}
            </div>
          )}
          <TimeList
            key={day ?? ''}
            times={list}
            value={day === date ? time : null}
            onSelect={(t) => day && onChange(`${day}T${t}`)}
            isTimeDisabled={isTimeDisabled}
            locale={locale}
            hourCycle={hourCycle}
            duration={duration}
            label={day ? `Times on ${formatDate(day, locale, { weekday: 'long', day: 'numeric', month: 'long' })}` : 'Times'}
            empty={emptyTimes ?? (day ? 'No times on this day.' : 'No days to pick from.')}
            className={styles.list}
          />
        </div>
      </div>
    </div>
  );
}
