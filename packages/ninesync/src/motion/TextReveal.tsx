import { useContext, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { TextRevealProps } from '@rnine/core/motion';
import { RevealOnce, cx } from '@rnine/core/kit';
import { useReducedMotion } from '@rnine/core/motion';
import { splitMark } from './splitMark';
import styles from './TextReveal.module.scss';

/** Titles already revealed this session (for ThemeProvider revealOnce). */
const seen = new Set<string>();

/**
 * NineSync's title effect: the title rises 4px and fades in (260ms), then
 * its pale mark draws under the last word, left to right (420ms). On hover
 * only the mark draws again. `duration` scales both; `delay` waits first.
 * Reduced motion shows the title and its mark at rest. Screen readers get
 * the text as it is.
 */
export function TextReveal({ text, as: Tag = 'span', className, id, trigger = 'mount', duration = 680, delay = 0 }: TextRevealProps) {
  const reduced = useReducedMotion();
  const once = useContext(RevealOnce);
  const ref = useRef<HTMLElement>(null);
  const still = reduced || (once && seen.has(text));
  // mount/view titles wait hidden until they play; hover ones are always there
  const [phase, setPhase] = useState<'waiting' | 'playing' | 'rest'>(still || trigger === 'hover' ? 'rest' : 'waiting');
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    if (still || trigger === 'hover') return;
    const play = () => {
      seen.add(text);
      setPhase('playing');
    };
    if (trigger === 'mount') {
      const t = window.setTimeout(play, delay);
      return () => window.clearTimeout(t);
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      play();
      return;
    }
    let t = 0;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        t = window.setTimeout(play, delay);
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [still, trigger, delay, text]);

  const [lead, last] = splitMark(text);
  const scale = duration / 680;
  const style = { '--ns-rise': `${Math.round(260 * scale)}ms`, '--ns-draw': `${Math.round(420 * scale)}ms` } as CSSProperties;
  const onPointerEnter = trigger === 'hover' && !reduced ? () => setReplay((n) => n + 1) : undefined;

  return (
    <Tag ref={ref} id={id} className={cx(styles.reveal, styles[phase], className)} style={style} onPointerEnter={onPointerEnter}>
      {lead}
      <span key={replay} className={cx(styles.mark, replay > 0 && styles.redraw)}>
        {last}
      </span>
    </Tag>
  );
}
