import { useState } from 'react';
import styles from './shell.module.scss';

type Props = { value: string; label?: string; className?: string };

/** Shows a value (hex, CSS variable) and copies it on click. */
export function CopyValue({ value, label, className }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('manual');
    }
    window.setTimeout(() => setState('idle'), 1400);
  };

  return (
    <button type="button" className={[styles.copy, className].filter(Boolean).join(' ')} onClick={copy} title={`Copy ${value}`}>
      <span className={styles.copyValue}>{label ?? value}</span>
      <span className={styles.copyState} role="status">
        {state === 'copied' ? 'Copied' : state === 'manual' ? 'Select to copy' : ''}
      </span>
    </button>
  );
}
