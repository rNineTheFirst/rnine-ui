import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { Check } from 'lucide-react';
import { cx } from '../../utils/cx';
import styles from './Choice.module.scss';

type ChoiceProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> & {
  label: ReactNode;
  /** Extra line under the label. */
  description?: ReactNode;
  /**
   * Hide the label (and description) visually; screen readers still read
   * them. For a box that stands alone, e.g. in a table cell its column names.
   */
  hideLabel?: boolean;
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

/** Ids that name the input by its label text only, with the description linked separately */
function useChoiceIds(description: ReactNode) {
  const id = useId();
  return {
    labelId: `${id}-label`,
    descId: description ? `${id}-desc` : undefined,
  };
}

/** Checkbox. Accent element: the checked box. */
export function Checkbox({ label, description, hideLabel, className, ref, ...input }: ChoiceProps) {
  const ids = useChoiceIds(description);
  return (
    <label className={cx(styles.choice, className)}>
      <input {...input} ref={ref} type="checkbox" className={styles.input} aria-labelledby={ids.labelId} aria-describedby={ids.descId} />
      <span className={styles.box} aria-hidden="true"><Check strokeWidth={2.5} /></span>
      <span className={cx(styles.text, hideLabel && styles.hiddenText)}>
        <span id={ids.labelId} className={styles.label}>{label}</span>
        {description && <span id={ids.descId} className={styles.description}>{description}</span>}
      </span>
    </label>
  );
}

/** On/off switch (a checkbox with role="switch"). Accent element: the on track. */
export function Switch({ label, description, hideLabel, className, ref, ...input }: ChoiceProps) {
  const ids = useChoiceIds(description);
  return (
    <label className={cx(styles.choice, className)}>
      <input {...input} ref={ref} type="checkbox" role="switch" className={styles.input} aria-labelledby={ids.labelId} aria-describedby={ids.descId} />
      <span className={styles.track} aria-hidden="true" />
      <span className={cx(styles.text, hideLabel && styles.hiddenText)}>
        <span id={ids.labelId} className={styles.label}>{label}</span>
        {description && <span id={ids.descId} className={styles.description}>{description}</span>}
      </span>
    </label>
  );
}

export type RadioOption = { value: string; label: ReactNode; description?: ReactNode; disabled?: boolean };

type RadioGroupProps = {
  /** Question the options answer (rendered as the group's legend). */
  legend: ReactNode;
  name?: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Lay the options out in a row instead of a column. */
  inline?: boolean;
  className?: string;
};

/** A set of radio buttons. Accent element: the selected dot. */
export function RadioGroup({ legend, name, options, value, defaultValue, onChange, inline, className }: RadioGroupProps) {
  const auto = useId();
  const groupName = name ?? auto;
  return (
    <fieldset className={cx(styles.group, inline && styles.inline, className)}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((o) => (
          <label key={o.value} className={styles.choice}>
            <input
              type="radio"
              name={groupName}
              value={o.value}
              disabled={o.disabled}
              className={styles.input}
              aria-labelledby={`${groupName}-${o.value}-label`}
              aria-describedby={o.description ? `${groupName}-${o.value}-desc` : undefined}
              {...(value !== undefined ? { checked: value === o.value } : { defaultChecked: defaultValue === o.value })}
              onChange={(e) => e.target.checked && onChange?.(o.value)}
            />
            <span className={styles.radio} aria-hidden="true" />
            <span className={styles.text}>
              <span id={`${groupName}-${o.value}-label`} className={styles.label}>{o.label}</span>
              {o.description && <span id={`${groupName}-${o.value}-desc`} className={styles.description}>{o.description}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
