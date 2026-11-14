import { Clock } from 'lucide-react';
import { formatTime, hourCycleOf, isTime, offeredTimes, type HourCycle } from '../../utils/dates';
import { PickerField } from '../DatePicker/PickerField';
import type { FieldOwnProps } from '../Field/FieldFrame';
import { TimeList } from './TimeList';
import styles from './TimePicker.module.scss';

export type TimeRules = {
  /** The times to offer, HH:mm, in order. Default: every `step` minutes from `min` to `max`. */
  times?: string[];
  /** Minutes between times when `times` isn't given. Default 30. */
  step?: number;
  /** First time, HH:mm. Default 00:00. */
  min?: string;
  /** Last time, HH:mm. Default 23:59. */
  max?: string;
  /** Times shown but not pickable (taken). */
  isTimeDisabled?: (time: string) => boolean;
  /** For the time's words. Default: the browser's. */
  locale?: string;
  /** 12- or 24-hour. Default: the locale's. */
  hourCycle?: HourCycle;
  /** Minutes each time lasts: the list shows when it ends ("to 10:30"). */
  duration?: number;
};

export type TimePickerProps = FieldOwnProps &
  TimeRules & {
    /** The time as HH:mm, or '' when empty. */
    value: string;
    onChange: (value: string) => void;
    /** The list alone, always open, without the field. */
    inline?: boolean;
    /** Inline only: list (one column) or grid (as many columns as fit). Default list. */
    layout?: 'list' | 'grid';
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    /** Adds a hidden input with the value, for forms that submit natively. */
    name?: string;
    id?: string;
  };

/**
 * A time picked from a list: a field that opens one, or (inline) the list
 * alone. Values are HH:mm strings; the list writes them the locale's way
 * (14:30 or 2:30 PM). Accent element: the picked time, and the field's own.
 */
export function TimePicker({ value, onChange, inline, layout = 'list', placeholder = 'Pick a time', disabled, required, name, id, times, step, min, max, isTimeDisabled, locale, hourCycle, duration, ...field }: TimePickerProps) {
  const cycle = hourCycle ?? hourCycleOf(locale);
  const list = offeredTimes({ times, step, min, max });
  const picked = isTime(value) ? value : null;
  const name_ = typeof field.label === 'string' ? field.label : 'Times';
  const listProps = { times: list, value: picked, isTimeDisabled, locale, hourCycle: cycle, duration, label: name_ };
  if (inline) return <TimeList {...listProps} layout={layout} onSelect={onChange} className={field.className} />;
  return (
    <PickerField
      {...field}
      id={id}
      display={picked ? formatTime(picked, locale, cycle) : ''}
      placeholder={placeholder}
      icon={<Clock strokeWidth={1.5} />}
      disabled={disabled}
      required={required}
      name={name}
      value={value}
      popLabel={name_}
    >
      {(close) => (
        <TimeList
          {...listProps}
          autoFocus
          className={styles.popList}
          onSelect={(t) => {
            onChange(t);
            close();
          }}
        />
      )}
    </PickerField>
  );
}
