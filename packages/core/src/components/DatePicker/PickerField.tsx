import { useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils/cx';
import { FieldFrame, type FieldOwnProps } from '../Field/FieldFrame';
import fieldStyles from '../Field/Field.module.scss';
import { usePickerPopover } from './popover';
import styles from './PickerField.module.scss';

type PickerFieldProps = FieldOwnProps & {
  id?: string;
  /** What the field shows: the value in words, or '' for the placeholder. */
  display: string;
  placeholder?: string;
  icon: ReactNode;
  disabled?: boolean;
  required?: boolean;
  /** A hidden input with `value`, for forms that submit natively. */
  name?: string;
  value: string;
  /** The popover's name for screen readers. */
  popLabel: string;
  /** The popover's content; `close` closes it and puts focus back on the field. */
  children: (close: () => void) => ReactNode;
};

/** The field half of DatePicker, TimePicker and DateTimePicker: a button in the field's frame that opens the picker over the page. */
export function PickerField({ label, hint, error, hideLabel, className, id, display, placeholder, icon, disabled, required, name, value, popLabel, children }: PickerFieldProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  const valueId = `${fieldId}-value`;
  const pop = usePickerPopover();
  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} hideLabel={hideLabel} required={required} className={className}>
      {(describedBy) => (
        <>
          <button
            ref={pop.triggerRef}
            id={fieldId}
            type="button"
            className={cx(fieldStyles.control, styles.trigger)}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={pop.open}
            aria-labelledby={`${fieldId}-label ${valueId}`}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            onClick={pop.toggle}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' && !pop.open) {
                e.preventDefault();
                pop.show();
              }
            }}
          >
            <span id={valueId} className={cx(styles.value, !display && styles.placeholder)}>
              {display || placeholder || ' '}
            </span>
            <span className={fieldStyles.affixIcon} aria-hidden="true">
              {icon}
            </span>
          </button>
          {name && <input type="hidden" name={name} value={value} />}
          {pop.open &&
            pop.host &&
            createPortal(
              <div {...pop.popProps} role="dialog" aria-label={popLabel} className={styles.popover}>
                {children(() => pop.close())}
              </div>,
              pop.host,
            )}
        </>
      )}
    </FieldFrame>
  );
}
