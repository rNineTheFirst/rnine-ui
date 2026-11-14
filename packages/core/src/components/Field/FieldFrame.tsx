import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Field.module.scss';

export type FieldOwnProps = {
  /** Visible label (required: placeholders are not labels). */
  label: ReactNode;
  /** Help text under the field. */
  hint?: ReactNode;
  /** Error message. Marks the field invalid and replaces the hint. */
  error?: ReactNode;
  /** Hide the label visually (still read by screen readers). */
  hideLabel?: boolean;
  className?: string;
};

type FrameProps = FieldOwnProps & {
  id: string;
  required?: boolean;
  children: (describedBy: string | undefined) => ReactNode;
};

/** Label, control, hint and error, wired together for assistive tech. */
export function FieldFrame({ id, label, hint, error, hideLabel, required, className, children }: FrameProps) {
  const noteId = `${id}-note`;
  const note = error ?? hint;
  return (
    <div className={cx(styles.field, error ? styles.invalid : undefined, className)}>
      <label id={`${id}-label`} htmlFor={id} className={cx(styles.label, hideLabel && styles.hidden)}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">required</span>}
      </label>
      {children(note ? noteId : undefined)}
      {note && (
        <span id={noteId} className={error ? styles.error : styles.hint} role={error ? 'alert' : undefined}>
          {note}
        </span>
      )}
    </div>
  );
}
