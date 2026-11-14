import { useId, type ChangeEvent } from 'react';
import { cx } from '../../utils/cx';
import type { TextFieldProps } from '../Field/Field';
import { FieldFrame } from '../Field/FieldFrame';
import fieldStyles from '../Field/Field.module.scss';
import styles from './DateField.module.scss';

export type DateFieldProps = Omit<TextFieldProps, 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max'> & {
  /** The date as YYYY-MM-DD, or '' when empty. */
  value: string;
  onChange: (value: string) => void;
  /** Earliest date, YYYY-MM-DD. */
  min?: string;
  /** Latest date, YYYY-MM-DD. */
  max?: string;
};

/**
 * A date input: the browser's own (typing by parts, its calendar, read
 * well by screen readers) in the library's field, with the calendar in the
 * page's mood. Values are YYYY-MM-DD strings, so they don't shift with time
 * zones. Accent element: the field's own (the mark before the label, the
 * caret, the focus edge).
 */
export function DateField({ label, hint, error, hideLabel, className, id, required, value, onChange, ref, ...input }: DateFieldProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} hideLabel={hideLabel} required={required} className={className}>
      {(describedBy) => (
        <input
          {...input}
          ref={ref}
          type="date"
          id={fieldId}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          required={required}
          aria-invalid={error ? true : input['aria-invalid']}
          aria-describedby={describedBy}
          className={cx(fieldStyles.control, styles.date)}
        />
      )}
    </FieldFrame>
  );
}
