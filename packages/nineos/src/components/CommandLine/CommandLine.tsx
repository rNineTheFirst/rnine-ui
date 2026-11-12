import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type Ref } from 'react';
import { cx } from '@rnine/core/kit';
import { ChipBar } from './ChipBar';
import styles from './CommandLine.module.scss';

export type CommandSpec = {
  /** e.g. "/projects" */
  name: string;
  description: string;
  /** Completions for an argument, e.g. project slugs for "/open". */
  args?: { value: string; description?: string }[];
};

type Props = {
  commands: CommandSpec[];
  /** Runs a command line exactly as typed or picked, e.g. "/open harbor". */
  onRun: (input: string) => void;
  /** Commands shown as tap-to-run chips above the line (phones never have to type). */
  chips?: string[];
  prompt?: string;
  placeholder?: string;
  /** Accessible name of the input. */
  label?: string;
  /** Ctrl/Cmd+K, or "/" outside a text field, focuses the line. Default true. */
  shortcut?: boolean;
  /** Called once, the first time someone focuses, types or taps a chip (e.g. for onboarding hints). */
  onEngage?: () => void;
  /** Escape on an empty line (e.g. close the open panel). */
  onEscapeEmpty?: () => void;
  runLabel?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
};

type Suggestion = { value: string; description: string };

/** All completions for what has been typed so far (commands, then their arguments). */
function suggest(commands: CommandSpec[], input: string): Suggestion[] {
  let q = input.trim().toLowerCase();
  if (!q) return [];
  if (!q.startsWith('/')) q = `/${q}`;
  const all: Suggestion[] = [];
  for (const c of commands) {
    if (c.args?.length) c.args.forEach((a) => all.push({ value: `${c.name} ${a.value}`, description: a.description ?? c.description }));
    else all.push({ value: c.name, description: c.description });
  }
  return all.filter((s) => s.value.startsWith(q)).slice(0, 8);
}

/**
 * The NineOS command line: a prompt with autocomplete, history (↑) and
 * tap-to-run chips. Magenta element: the prompt, caret, focus edge and Run.
 * Always pair it with a way to use the app without typing (Menu mode).
 */
export function CommandLine({
  commands,
  onRun,
  chips,
  prompt = '>',
  placeholder = 'type /help, or tap a command',
  label = 'Command',
  shortcut = true,
  onEngage,
  onEscapeEmpty,
  runLabel = 'Run',
  className,
  ref,
}: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(true);
  const history = useRef<string[]>([]);
  const historyIndex = useRef(-1);
  const engaged = useRef(false);

  const options = useMemo(() => (open ? suggest(commands, value) : []), [commands, value, open]);
  const expanded = options.length > 0;

  const engage = () => {
    if (engaged.current) return;
    engaged.current = true;
    onEngage?.();
  };

  const run = (line: string) => {
    const text = line.trim();
    if (!text) return;
    if (history.current[0] !== text) history.current.unshift(text);
    historyIndex.current = -1;
    setValue('');
    setActive(-1);
    onRun(text);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    run(active >= 0 && options[active] ? options[active].value : value);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    engage();
    if (e.key === 'ArrowDown' && expanded) {
      e.preventDefault();
      setActive((a) => (a + 1) % options.length);
    } else if (e.key === 'ArrowUp' && expanded) {
      e.preventDefault();
      setActive((a) => (a - 1 + options.length) % options.length);
    } else if (e.key === 'ArrowUp' && !value && history.current.length) {
      e.preventDefault();
      historyIndex.current = Math.min(history.current.length - 1, historyIndex.current + 1);
      setValue(history.current[historyIndex.current]);
    } else if (e.key === 'Tab' && expanded) {
      e.preventDefault();
      setValue(options[Math.max(0, active)].value);
      setActive(-1);
    } else if (e.key === 'Escape') {
      if (value) {
        setValue('');
        setActive(-1);
      } else onEscapeEmpty?.();
    }
  };

  // Ctrl/Cmd+K anywhere, or "/" when not typing, jumps to the line
  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || (el as HTMLElement | null)?.isContentEditable;
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
        if (e.key === '/') setValue('/');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shortcut]);

  return (
    <div ref={ref} className={cx(styles.root, className)}>
      {expanded && (
        <ul className={styles.list} role="listbox" id={`${id}-list`} aria-label="Matching commands">
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={styles.option}
              onMouseDown={(e) => {
                e.preventDefault();
                run(o.value);
              }}
            >
              <code>{o.value}</code>
              <span>{o.description}</span>
            </li>
          ))}
        </ul>
      )}
      {chips && chips.length > 0 && (
        <ChipBar
          label="Quick commands"
          onPointerDown={engage}
          onSelect={(key) => {
            // Keyboard and pointer alike: picking a chip is using the command line
            engage();
            run(key);
          }}
          items={chips.map((c) => ({ key: c, prefix: c.startsWith('/') ? '/' : undefined, label: c.replace(/^\//, '') }))}
        />
      )}
      <form className={styles.prompt} onSubmit={onSubmit} autoComplete="off">
        <label htmlFor={`${id}-input`} className={styles.label}>
          {prompt}
        </label>
        <input
          ref={inputRef}
          id={`${id}-input`}
          className={styles.input}
          type="text"
          value={value}
          placeholder={placeholder}
          aria-label={label}
          role="combobox"
          aria-expanded={expanded}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          enterKeyHint="go"
          spellCheck={false}
          autoCapitalize="off"
          onFocus={engage}
          onBlur={() => setOpen(false)}
          onChange={(e) => {
            setValue(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        <button type="submit" className={styles.run}>
          {runLabel}
        </button>
      </form>
    </div>
  );
}
