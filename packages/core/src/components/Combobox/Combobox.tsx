import { useEffect, useId, useImperativeHandle, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent, type ReactNode, type Ref } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { popoverHost, useAnchoredPosition } from '../../hooks/anchoredPosition';
import { cx } from '../../utils/cx';
import { FieldFrame, type FieldOwnProps } from '../Field/FieldFrame';
import fieldStyles from '../Field/Field.module.scss';
import styles from './Combobox.module.scss';

export type ComboboxOption = {
  value: string;
  /** What the field shows once it's picked, e.g. a part number. */
  label: string;
  /** A second line in the list, also searched: "MS plate 10mm 4×8". */
  description?: string;
  /** More words it's found by (not shown): a category, an old code. */
  keywords?: string[];
  disabled?: boolean;
};

export type ComboboxProps = FieldOwnProps & {
  options: ComboboxOption[];
  /** The picked option's value, or null. */
  value: string | null;
  /** Gets the picked option too, so a form can fill in what goes with it (a unit, a price). */
  onChange: (value: string | null, option: ComboboxOption | null) => void;
  /**
   * Which options match what's typed. Default: every typed word is in the
   * label, description or keywords (any case). false: `options` are already
   * the results (a search on a server, through onQueryChange).
   */
  filter?: false | ((option: ComboboxOption, query: string) => boolean);
  /** Runs on every change of the typed text. */
  onQueryChange?: (query: string) => void;
  /** Shows loadingMessage instead of the options (a search on its way). */
  loading?: boolean;
  /** Shown when nothing matches. Default "No matches". */
  emptyMessage?: ReactNode;
  /** Default "Loading…". */
  loadingMessage?: ReactNode;
  placeholder?: string;
  /** Adds a hidden input with the value, for forms that submit natively. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  /** The text input. */
  ref?: Ref<HTMLInputElement>;
};

const words = (text: string) => text.toLowerCase().split(/\s+/).filter(Boolean);

function defaultFilter(option: ComboboxOption, query: string) {
  const text = [option.label, option.description ?? '', ...(option.keywords ?? [])].join(' ').toLowerCase();
  return words(query).every((w) => text.includes(w));
}

/**
 * A searchable picker: type to narrow a long list (part numbers, suppliers),
 * pick with the arrows and Enter or by click. Leaving the field with text
 * that names no option puts the last pick back; clearing it and leaving
 * clears the value. The list opens over everything (no table or drawer clips
 * it) and flips to fit. Accent element: the bar on the highlighted option, and
 * the field's own (the mark before the label, the caret, the focus edge).
 */
export function Combobox({
  label,
  hint,
  error,
  hideLabel,
  className,
  options,
  value,
  onChange,
  filter,
  onQueryChange,
  loading,
  emptyMessage = 'No matches',
  loadingMessage = 'Loading…',
  placeholder,
  name,
  required,
  disabled,
  id,
  ref,
}: ComboboxProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  const listId = `${fieldId}-list`;
  const optionId = (i: number) => `${listId}-${i}`;

  const [open, setOpen] = useState(false);
  // What's typed since the last pick; null shows the picked option's label
  const [draft, setDraft] = useState<string | null>(null);
  const [active, setActive] = useState(-1);
  // The last pick, so its label stays when server results move on
  const [picked, setPicked] = useState<ComboboxOption | null>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  const selected = options.find((o) => o.value === value) ?? (picked && picked.value === value ? picked : null);
  const results = (text: string) =>
    filter === false || !text.trim() ? options : options.filter((o) => (filter ?? defaultFilter)(o, text));
  const shown = results(draft ?? '');
  const activeIndex = open && !loading && shown[active] && !shown[active].disabled ? active : -1;

  useAnchoredPosition(open, boxRef, popRef, { matchWidth: true });

  // Keep the highlighted option in view
  useEffect(() => {
    if (activeIndex < 0) return;
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex]);

  // The next option that can be picked from `from` (-1: none yet), wrapping
  const step = (from: number, dir: 1 | -1) => {
    const n = shown.length;
    const start = from < 0 ? (dir > 0 ? -1 : 0) : from;
    for (let k = 1; k <= n; k++) {
      const i = (((start + dir * k) % n) + n) % n;
      if (!shown[i].disabled) return i;
    }
    return -1;
  };

  const show = (at: number) => {
    setHost(popoverHost(boxRef.current));
    setOpen(true);
    setActive(at);
  };

  // Opens on the picked option, else the first (or last)
  const openList = (dir: 1 | -1) => {
    const at = shown.findIndex((o) => o.value === value && !o.disabled);
    show(at >= 0 ? at : step(-1, dir));
  };

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const choose = (option: ComboboxOption | null) => {
    setPicked(option);
    if ((option?.value ?? null) !== value) onChange(option?.value ?? null, option);
  };

  const pick = (option: ComboboxOption) => {
    if (option.disabled) return;
    setDraft(null);
    close();
    choose(option);
  };

  // Leaving the field: an emptied field clears, a typed label picks, anything else goes back
  const commit = () => {
    if (draft !== null) {
      const text = draft.trim().toLowerCase();
      if (!text) choose(null);
      else {
        const exact = shown.find((o) => !o.disabled && o.label.toLowerCase() === text);
        if (exact) choose(exact);
      }
    }
    setDraft(null);
    close();
  };

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setDraft(text);
    onQueryChange?.(text);
    show(text.trim() ? results(text).findIndex((o) => !o.disabled) : -1);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) return openList(1);
        return setActive(step(activeIndex, 1));
      case 'ArrowUp':
        e.preventDefault();
        if (!open) return openList(-1);
        if (e.altKey) return close();
        return setActive(step(activeIndex, -1));
      case 'Enter':
        if (!open || activeIndex < 0) return;
        e.preventDefault();
        return pick(shown[activeIndex]);
      case 'Escape':
        if (!open && draft === null) return;
        // Not also the dialog or drawer around it
        e.preventDefault();
        e.stopPropagation();
        setDraft(null);
        return close();
    }
  };

  // A press on the box (the chevron, the padding) toggles the list and keeps focus in the input;
  // presses in the list come here through the portal and aren't the box's
  const onBoxDown = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled || e.target === inputRef.current || !boxRef.current?.contains(e.target as Node)) return;
    e.preventDefault();
    inputRef.current?.focus();
    if (open) close();
    else openList(1);
  };

  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} hideLabel={hideLabel} required={required} className={className}>
      {(describedBy) => (
        <div ref={boxRef} className={cx(fieldStyles.control, fieldStyles.box)} onMouseDown={onBoxDown}>
          <input
            ref={inputRef}
            id={fieldId}
            type="text"
            role="combobox"
            className={fieldStyles.inner}
            value={draft ?? selected?.label ?? ''}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={onInput}
            onKeyDown={onKey}
            onBlur={commit}
            onClick={() => !open && openList(1)}
          />
          <span className={cx(fieldStyles.affixIcon, styles.chevron, open && styles.flipped)} aria-hidden="true">
            <ChevronDown strokeWidth={1.5} />
          </span>
          {name && <input type="hidden" name={name} value={value ?? ''} />}
          {open &&
            host &&
            createPortal(
              // Presses in the list keep focus in the input, so it doesn't blur and commit first
              <div ref={popRef} className={styles.popover} onMouseDown={(e) => e.preventDefault()}>
                <div ref={listRef} id={listId} role="listbox" aria-labelledby={`${fieldId}-label`} className={styles.list}>
                  {!loading &&
                    shown.map((o, i) => (
                      <div
                        key={o.value}
                        id={optionId(i)}
                        data-index={i}
                        role="option"
                        aria-selected={o.value === value}
                        aria-disabled={o.disabled || undefined}
                        className={cx(styles.option, i === activeIndex && styles.active)}
                        onClick={() => pick(o)}
                        onPointerMove={() => !o.disabled && i !== activeIndex && setActive(i)}
                      >
                        <span className={styles.text}>
                          <span className={styles.label}>{o.label}</span>
                          {o.description && <span className={styles.description}>{o.description}</span>}
                        </span>
                        {o.value === value && <Check className={styles.check} strokeWidth={2} aria-hidden="true" />}
                      </div>
                    ))}
                </div>
                {(loading || shown.length === 0) && (
                  <div className={styles.message} role="status">
                    {loading ? loadingMessage : emptyMessage}
                  </div>
                )}
              </div>,
              host,
            )}
        </div>
      )}
    </FieldFrame>
  );
}
