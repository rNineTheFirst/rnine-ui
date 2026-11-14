import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from '../../utils/cx';
import { FieldFrame, type FieldOwnProps } from './FieldFrame';
import styles from './Field.module.scss';

export type TextFieldProps = FieldOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & { ref?: Ref<HTMLInputElement> };

/** Single-line text input with label, hint and error. */
export function TextField({ label, hint, error, hideLabel, className, id, required, ref, ...input }: TextFieldProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} hideLabel={hideLabel} required={required} className={className}>
      {(describedBy) => (
        <input
          {...input}
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : input['aria-invalid']}
          aria-describedby={describedBy}
          className={styles.control}
        />
      )}
    </FieldFrame>
  );
}

export type TextAreaProps = FieldOwnProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & { ref?: Ref<HTMLTextAreaElement> };

/** Multi-line text input with label, hint and error. */
export function TextArea({ label, hint, error, hideLabel, className, id, required, rows = 4, ref, ...area }: TextAreaProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} hideLabel={hideLabel} required={required} className={className}>
      {(describedBy) => (
        <textarea
          {...area}
          ref={ref}
          id={fieldId}
          rows={rows}
          required={required}
          aria-invalid={error ? true : area['aria-invalid']}
          aria-describedby={describedBy}
          className={cx(styles.control, styles.area)}
        />
      )}
    </FieldFrame>
  );
}

export type SelectProps = FieldOwnProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & { ref?: Ref<HTMLSelectElement>; children: ReactNode };

/** Native select (keyboard and screen-reader friendly everywhere), styled by the library. */
export function Select({ label, hint, error, hideLabel, className, id, required, children, ref, ...select }: SelectProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} hideLabel={hideLabel} required={required} className={className}>
      {(describedBy) => (
        <span className={styles.selectWrap}>
          <select
            {...select}
            ref={ref}
            id={fieldId}
            required={required}
            aria-invalid={error ? true : select['aria-invalid']}
            aria-describedby={describedBy}
            className={cx(styles.control, styles.select)}
          >
            {children}
          </select>
        </span>
      )}
    </FieldFrame>
  );
}
