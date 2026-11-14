import { CalendarDays } from 'lucide-react';
import { formatDate, isDate } from '../../utils/dates';
import type { FieldOwnProps } from '../Field/FieldFrame';
import { Calendar } from './Calendar';
import { PickerField } from './PickerField';

export type DateRules = {
  /** Earliest date, YYYY-MM-DD. */
  min?: string;
  /** Latest date, YYYY-MM-DD. */
  max?: string;
  /** Days that can't be picked (a holiday, a full day). */
  isDateDisabled?: (date: string) => boolean;
  /** For dates and weekday names. Default: the browser's. */
  locale?: string;
  /** 0 = Sunday … 6 = Saturday. Default: the locale's. */
  weekStart?: number;
  /** Default: today in the browser's zone (set it for stories and tests). */
  today?: string;
};

export type DatePickerProps = FieldOwnProps &
  DateRules & {
    /** The date as YYYY-MM-DD, or '' when empty. */
    value: string;
    onChange: (value: string) => void;
    /** The calendar alone, always open, without the field. */
    inline?: boolean;
    /** Days that can be picked look open (filled, with a dot): for availability. */
    availability?: boolean;
    /** How the field writes the date. Default: "18 Nov 2026" in the locale. */
    format?: Intl.DateTimeFormatOptions;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    /** Adds a hidden input with the value, for forms that submit natively. */
    name?: string;
    id?: string;
  };

const FIELD_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

/**
 * A date picked from a calendar: a field that opens one, or (inline) the
 * calendar alone. Values are YYYY-MM-DD strings, so they don't shift with
 * time zones. For typing a date (a birthday, a range filter), DateField.
 * Accent element: the picked day, and the field's own.
 */
export function DatePicker({ value, onChange, inline, availability, format = FIELD_FORMAT, placeholder = 'Pick a date', disabled, required, name, id, min, max, isDateDisabled, locale, weekStart, today, ...field }: DatePickerProps) {
  const picked = isDate(value) ? value : null;
  const rules = { min, max, isDateDisabled, locale, weekStart, today, availability };
  if (inline) {
    return <Calendar {...rules} value={picked} onSelect={onChange} label={typeof field.label === 'string' ? field.label : undefined} className={field.className} />;
  }
  return (
    <PickerField
      {...field}
      id={id}
      display={picked ? formatDate(picked, locale, format) : ''}
      placeholder={placeholder}
      icon={<CalendarDays strokeWidth={1.5} />}
      disabled={disabled}
      required={required}
      name={name}
      value={value}
      popLabel={typeof field.label === 'string' ? field.label : 'Pick a date'}
    >
      {(close) => (
        <Calendar
          {...rules}
          value={picked}
          autoFocus
          label={typeof field.label === 'string' ? field.label : undefined}
          onSelect={(d) => {
            onChange(d);
            close();
          }}
        />
      )}
    </PickerField>
  );
}
