import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { cx } from '@rnine/core/kit';
import type { TextRevealProps } from '@rnine/core/motion';
import { useTextReveal } from './useDecrypt';
import styles from './DecryptText.module.scss';


type Cell = { left: number; top: number; width: number; height: number };

/** Where each character of the text node sits, relative to `box`. */
function measure(node: Text, box: HTMLElement, chars: string[]): Cell[] | null {
  const range = document.createRange();
  if (typeof range.getClientRects !== 'function') return null;
  const origin = box.getBoundingClientRect();
  let offset = 0;
  return chars.map((c) => {
    range.setStart(node, offset);
    range.setEnd(node, offset + c.length);
    offset += c.length;
    const rects = range.getClientRects();
    const r = rects[rects.length - 1] ?? range.getBoundingClientRect();
    return { left: r.left - origin.left, top: r.top - origin.top, width: r.width, height: r.height };
  });
}

/**
 * Text that decodes from magenta terminal symbols, left to right, in 1s.
 * The real text never moves: it stays as plain text (transparent while the
 * effect runs) and every glyph is pinned to the measured position of its
 * letter, so the effect can't wrap differently or spill into the next
 * content. Screen readers always get the final text.
 */
export function TextReveal({ text, as: Tag = 'span', className, id, trigger = 'view', duration = 1000, delay = 0 }: TextRevealProps) {
  const [frame, play] = useTextReveal(text, duration);
  const ref = useRef<HTMLElement>(null);
  const baseRef = useRef<HTMLSpanElement>(null);
  const [cells, setCells] = useState<Cell[] | null>(null);
  const chars = Array.from(text);
  const running = frame !== null;

  useEffect(() => {
    if (trigger === 'mount') {
      const t = window.setTimeout(play, delay);
      return () => window.clearTimeout(t);
    }
    if (trigger === 'view' && ref.current) {
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          window.setTimeout(play, delay);
          io.disconnect();
        }
      }, { threshold: 0.4 });
      io.observe(ref.current);
      return () => io.disconnect();
    }
  }, [trigger, play, delay]);

  // Measure when the effect starts, before it paints (cells from an earlier run are only used while running)
  useLayoutEffect(() => {
    if (!running) return;
    const node = baseRef.current?.firstChild;
    if (node instanceof Text && ref.current) setCells(measure(node, ref.current, Array.from(text)));
  }, [running, text]);

  const pinned = running && cells;

  return (
    <Tag ref={ref} id={id} className={cx(styles.text, className)} onMouseEnter={trigger === 'hover' ? play : undefined}>
      {/* What assistive tech reads, always the final text (works inside buttons and links too) */}
      <span className={styles.sr}>{text}</span>
      <span ref={baseRef} aria-hidden="true" className={pinned ? styles.running : undefined}>
        {text}
      </span>
      {pinned && (
        <span aria-hidden="true" className={styles.overlay}>
          {chars.map((c, i) => {
            const cell = cells[i];
            if (!cell || /\s/.test(c)) return null;
            const style: CSSProperties = { left: cell.left, top: cell.top, width: cell.width, height: cell.height, lineHeight: `${cell.height}px` };
            const glyph = frame[i];
            return (
              <span key={i} className={glyph ? styles.glyph : styles.char} style={style}>
                {glyph ?? c}
              </span>
            );
          })}
        </span>
      )}
    </Tag>
  );
}
