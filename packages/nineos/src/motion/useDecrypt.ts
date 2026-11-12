import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion, type TextRevealControl } from '@rnine/core/motion';

/** Terminal symbols the letters decode from. */
export const DECRYPT_GLYPHS = '<>/\\[]{}=+*#_:;';
/** How long each glyph stays before changing, in ms (each letter on its own rhythm). */
export const DECRYPT_TICK = 70;
/** Share of the duration where every letter is still scrambled, before the sweep. */
const HOLD = 0.12;
/** Only letters and digits scramble; spaces and punctuation keep their place. */
const SCRAMBLES = /[\p{L}\p{N}]/u;

/** Small integer hash: deterministic, without the visible repeats of a simple formula. */
function hash(a: number, b: number): number {
  let x = (Math.imul(a + 1, 374761393) + Math.imul(b + 1, 668265263)) | 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  return (x ^ (x >>> 16)) >>> 0;
}

/**
 * One frame of the effect: for each character of `text`, the glyph to draw
 * over it, or null when it shows the real character. Pure and deterministic:
 * the same text, progress and time always give the same frame. Each letter
 * has its own glyph sequence and changes on its own offset rhythm, so
 * neighbours never move in step.
 *
 * @param progress 0 (all scrambled) to 1 (fully decoded)
 * @param elapsed milliseconds since the effect started
 */
export function decryptFrame(text: string, progress: number, elapsed: number): (string | null)[] {
  const chars = Array.from(text);
  const n = chars.length;
  return chars.map((c, i) => {
    if (progress >= 1 || !SCRAMBLES.test(c)) return null;
    const resolvesAt = HOLD + (i / n) * (1 - HOLD);
    if (progress >= resolvesAt) return null;
    const phase = hash(i, 999) % DECRYPT_TICK;
    const tick = Math.floor((elapsed + phase) / DECRYPT_TICK);
    return DECRYPT_GLYPHS[hash(i, tick) % DECRYPT_GLYPHS.length];
  });
}

/**
 * Drives NineOS's text reveal (the decrypt) by hand. Returns the current frame (null when the text is
 * at rest) and a function that plays it again. Does nothing with reduced motion.
 */
export function useTextReveal(text: string, duration = 1000): TextRevealControl {
  const reduced = useReducedMotion();
  const [frame, setFrame] = useState<(string | null)[] | null>(null);
  const raf = useRef(0);

  const play = useCallback(() => {
    if (reduced) return;
    cancelAnimationFrame(raf.current);
    let start = 0;
    let last = '';
    const step = (t: number) => {
      if (!start) start = t;
      const elapsed = t - start;
      const progress = Math.min(1, elapsed / duration);
      const next = progress >= 1 ? null : decryptFrame(text, progress, elapsed);
      // Re-render only when a glyph actually changed
      const key = next ? next.join('\u0000') : '';
      if (key !== last || !next) {
        last = key;
        setFrame(next);
      }
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [text, duration, reduced]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // A new text, or reduced motion turning on, shows the final text at once
  const [prev, setPrev] = useState({ text, reduced });
  if (prev.text !== text || prev.reduced !== reduced) {
    setPrev({ text, reduced });
    setFrame(null);
  }

  return [frame, play] as const;
}
