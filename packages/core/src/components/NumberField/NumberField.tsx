import { useId, useImperativeHandle, useMemo, useRef, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cx } from '../../utils/cx';
import { FieldFrame, type FieldOwnProps } from '../Field/FieldFrame';
import fieldStyles from '../Field/Field.module.scss';
import styles from './NumberField.module.scss';

export type NumberFieldProps = FieldOwnProps & {
  /** The number, or null when empty. */
  value: number | null;
  /** Runs as it's typed (when the text is a number) and on leaving, held to min/max and rounded. */
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  /** What the arrow keys and the stepper add; PageUp/PageDown add ten. Default 1. */
  step?: number;
  /** Decimal places shown and kept: 0 for counts. Default: the currency's (2 for most), else as typed. */
  fractionDigits?: number;
  /** An ISO currency code ("PHP", "USD"): shows its symbol and formats the number as money. */
  currency?: string;
  /** After the number: "pcs", "kg", "m". */
  unit?: ReactNode;
  /** For the number format. Default: the browser's. */
  locale?: string;
  /** − and + buttons in the field. */
  stepper?: boolean;
  /** Names of the stepper's buttons. Default "Decrease" / "Increase". */
  decreaseLabel?: string;
  increaseLabel?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  /** The text input. */
  ref?: Ref<HTMLInputElement>;
};

type Format = {
  text: (n: number) => string;
  parse: (text: string) => number | null | undefined;
  symbol?: { text: string; after: boolean };
  digits?: number;
};

function makeFormat(locale: string | undefined, currency: string | undefined, fractionDigits: number | undefined): Format {
  const money = currency ? new Intl.NumberFormat(locale, { style: 'currency', currency }) : undefined;
  const digits = fractionDigits ?? money?.resolvedOptions().maximumFractionDigits;
  const number = new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits ?? 0,
    maximumFractionDigits: digits ?? 20,
  });
  const parts = new Intl.NumberFormat(locale).formatToParts(-12345.6);
  const decimal = parts.find((p) => p.type === 'decimal')?.value ?? '.';
  const minus = parts.find((p) => p.type === 'minusSign')?.value ?? '-';
  const moneyParts = money?.formatToParts(1);
  const symbolAt = moneyParts?.findIndex((p) => p.type === 'currency') ?? -1;
  return {
    digits,
    text: (n) => number.format(n),
    // undefined: not a number (yet); null: empty
    parse: (text) => {
      const t = text.trim();
      if (!t) return null;
      let clean = '';
      for (const ch of t) {
        if (ch >= '0' && ch <= '9') clean += ch;
        else if (ch === decimal) clean += '.';
        else if ((ch === minus || ch === '-' || ch === '−') && !clean) clean = '-';
      }
      const n = Number(clean);
      return clean === '' || clean === '-' || clean === '.' || Number.isNaN(n) ? undefined : n;
    },
    symbol:
      moneyParts && symbolAt >= 0
        ? { text: moneyParts[symbolAt].value, after: symbolAt > moneyParts.findIndex((p) => p.type === 'integer') }
        : undefined,
  };
}

const decimalsOf = (n: number) => (String(n).split('.')[1] ?? '').length;

/**
 * A number input for quantities and prices: a currency symbol or a unit in
 * the field, grouping and fixed decimals once you leave it (12,450.00), min
 * and max held, the arrow keys step it (a spinbutton), optional − and +
 * buttons. Accent element: the field's own (the mark before the label, the
 * caret, the focus edge).
 */
export function NumberField({
  label,
  hint,
  error,
  hideLabel,
  className,
  value,
  onChange,
  min,
  max,
  step = 1,
  fractionDigits,
  currency,
  unit,
  locale,
  stepper,
  decreaseLabel = 'Decrease',
  increaseLabel = 'Increase',
  placeholder,
  name,
  required,
  disabled,
  readOnly,
  id,
  onBlur,
  ref,
}: NumberFieldProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  // What's being typed; null shows the value, formatted
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  const format = useMemo(() => makeFormat(locale, currency, fractionDigits), [locale, currency, fractionDigits]);
  const shown = value == null ? '' : format.text(value);
  const places = Math.max(format.digits ?? 0, decimalsOf(step));

  const tidy = (n: number) => {
    let out = n;
    if (min != null) out = Math.max(min, out);
    if (max != null) out = Math.min(max, out);
    return format.digits != null || decimalsOf(step) ? Number(out.toFixed(places)) : out;
  };

  const set = (n: number | null) => {
    if (n !== value) onChange(n);
  };

  const stepBy = (times: number) => {
    if (disabled || readOnly) return;
    const base = value ?? (times > 0 ? (min ?? 0) - step : (max ?? 0) + step);
    const fromDraft = draft !== null ? format.parse(draft) : undefined;
    setDraft(null);
    set(tidy((typeof fromDraft === 'number' ? fromDraft : base) + times * step));
  };

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    const n = format.parse(e.target.value);
    if (n !== undefined) set(n);
  };

  const commit = (e: FocusEvent<HTMLInputElement>) => {
    if (draft !== null) {
      const n = format.parse(draft);
      // Not a number: back to the last value
      if (n !== undefined) set(n === null ? null : tidy(n));
      setDraft(null);
    } else if (value != null && tidy(value) !== value) set(tidy(value));
    onBlur?.(e);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const to = (n: number) => {
      e.preventDefault();
      setDraft(null);
      set(n);
    };
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        return stepBy(1);
      case 'ArrowDown':
        e.preventDefault();
        return stepBy(-1);
      case 'PageUp':
        e.preventDefault();
        return stepBy(10);
      case 'PageDown':
        e.preventDefault();
        return stepBy(-10);
      case 'Home':
        if (min != null && !readOnly) to(min);
        return;
      case 'End':
        if (max != null && !readOnly) to(max);
        return;
    }
  };

  const symbol = format.symbol;
  const text = (n: number) => {
    const t = format.text(n);
    const withSymbol = symbol ? (symbol.after ? `${t} ${symbol.text}` : `${symbol.text}${t}`) : t;
    return typeof unit === 'string' ? `${withSymbol} ${unit}` : withSymbol;
  };
  const noMinus = min != null && min >= 0;
  const busy = disabled || readOnly;

  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} hideLabel={hideLabel} required={required} className={className}>
      {(describedBy) => (
        <div
          className={cx(fieldStyles.control, fieldStyles.box)}
          onMouseDown={(e) => {
            // A press on the padding, the symbol or a stepper button keeps focus in the input
            if (e.target !== inputRef.current) {
              e.preventDefault();
              inputRef.current?.focus();
            }
          }}
        >
          {symbol && !symbol.after && <span className={fieldStyles.affix} aria-hidden="true">{symbol.text}</span>}
          <input
            ref={inputRef}
            id={fieldId}
            type="text"
            role="spinbutton"
            inputMode={noMinus ? (format.digits === 0 ? 'numeric' : 'decimal') : 'text'}
            autoComplete="off"
            className={cx(fieldStyles.inner, styles.input)}
            value={draft ?? shown}
            name={name}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            aria-valuenow={value ?? undefined}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={value == null ? undefined : text(value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={onInput}
            onKeyDown={onKey}
            onBlur={commit}
          />
          {symbol?.after && <span className={fieldStyles.affix} aria-hidden="true">{symbol.text}</span>}
          {unit && <span className={fieldStyles.affix} aria-hidden="true">{unit}</span>}
          {stepper && (
            <span className={styles.stepper}>
              <button
                type="button"
                tabIndex={-1}
                className={fieldStyles.affixButton}
                aria-label={decreaseLabel}
                aria-controls={fieldId}
                disabled={busy || (min != null && value != null && value <= min)}
                onClick={() => stepBy(-1)}
              >
                <Minus strokeWidth={1.75} aria-hidden="true" />
              </button>
              <button
                type="button"
                tabIndex={-1}
                className={fieldStyles.affixButton}
                aria-label={increaseLabel}
                aria-controls={fieldId}
                disabled={busy || (max != null && value != null && value >= max)}
                onClick={() => stepBy(1)}
              >
                <Plus strokeWidth={1.75} aria-hidden="true" />
              </button>
            </span>
          )}
        </div>
      )}
    </FieldFrame>
  );
}
