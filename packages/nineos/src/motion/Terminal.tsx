import { useEffect, useState } from 'react';
import { useReducedMotion } from '@rnine/core/motion';
import styles from './Terminal.module.scss';

export type TerminalLine = { text: string; tone?: 'cmd' | 'dim' | 'ok' };

type Props = { lines: TerminalLine[]; label: string; loopDelay?: number };

/** Terminal that types its first line, prints the rest, then starts over. */
export function Terminal({ lines, label, loopDelay = 4200 }: Props) {
  const reduced = useReducedMotion();
  // Starts complete, so the first frame (and reduced motion) shows the full output
  const [state, setState] = useState({ count: lines.length, typed: lines[0]?.text.length ?? 0 });

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(() => !cancelled && fn(), ms));

    const run = () => {
      setState({ count: 1, typed: 0 });
      const first = lines[0]?.text ?? '';
      let k = 0;
      const type = () => {
        k++;
        setState({ count: 1, typed: k });
        if (k < first.length) later(type, 45 + Math.random() * 55);
        else later(() => print(1), 380);
      };
      const print = (n: number) => {
        if (n >= lines.length) {
          later(run, loopDelay);
          return;
        }
        setState({ count: n + 1, typed: first.length });
        later(() => print(n + 1), 260 + Math.random() * 240);
      };
      type();
    };
    later(run, 1400);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [lines, reduced, loopDelay]);

  const typing = state.typed < (lines[0]?.text.length ?? 0);
  return (
    <div className={styles.term} role="img" aria-label={`${label}: ${lines.map((l) => l.text).join('. ')}`}>
      {lines.slice(0, state.count).map((l, i) => (
        <div key={i} className={[styles.line, l.tone && styles[l.tone]].filter(Boolean).join(' ')}>
          {i === 0 ? l.text.slice(0, state.typed) : l.text}
          {i === 0 && typing && <span className={styles.caret} />}
        </div>
      ))}
      {!typing && <span className={styles.caret} />}
    </div>
  );
}
