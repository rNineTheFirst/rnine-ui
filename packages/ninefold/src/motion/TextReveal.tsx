import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { cx } from '@rnine/core/kit';
import { useReducedMotion, type TextRevealProps } from '@rnine/core/motion';
import { paint } from '../fx/overlay';
import { clamp, easeOut, glowSprite, isNight, lerp, readRoles } from '../fx/paint';
import styles from './TextReveal.module.scss';

/** The tuned feel (round 3). */
const GROW_STAGGER_MS = 10; // between letters, by day
const GROW_MS = 640; // each letter
const GATHER_COUNT = 480; // fireflies, at night

type Cell = { left: number; top: number; width: number; height: number };

/** The element's font, as the canvas and the font loader name it. */
const fontOf = (box: HTMLElement) => {
  const s = getComputedStyle(box);
  return `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
};

/**
 * Resolves once the element's font has loaded (at most `cap` ms), so the
 * letters are measured where they'll stay. Measured with the fallback font,
 * the fireflies would gather where the letters were before the font swapped in.
 */
function fontReady(box: HTMLElement, text: string, cap = 1500): Promise<void> {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (!fonts?.load) return Promise.resolve();
  const loaded = fonts.load(fontOf(box), text).then(() => fonts.ready).then(() => undefined, () => undefined);
  return Promise.race([loaded, new Promise<void>((resolve) => window.setTimeout(resolve, cap))]);
}

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

/** Points inside the glyphs (page coordinates), from the measured cells drawn in the element's font. */
function glyphPoints(box: HTMLElement, chars: string[], cells: Cell[]): [number, number][] {
  const r = box.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(r.width);
  canvas.height = Math.ceil(r.height);
  const g = canvas.getContext('2d');
  if (!g || !canvas.width || !canvas.height) return [];
  g.font = fontOf(box);
  g.textBaseline = 'alphabetic';
  g.fillStyle = '#000';
  chars.forEach((c, i) => {
    const cell = cells[i];
    if (!cell || /\s/.test(c)) return;
    // A character's box is the font's ascent + descent, centered in the line: its baseline sits at the ascent
    const m = g.measureText(c);
    const ascent = m.fontBoundingBoxAscent ?? cell.height * 0.8;
    const descent = m.fontBoundingBoxDescent ?? cell.height * 0.2;
    g.fillText(c, cell.left, cell.top + (cell.height - (ascent + descent)) / 2 + ascent);
  });
  const data = g.getImageData(0, 0, canvas.width, canvas.height).data;
  const points: [number, number][] = [];
  const ox = r.left + window.scrollX;
  const oy = r.top + window.scrollY;
  for (let y = 0; y < canvas.height; y += 4) {
    for (let x = 0; x < canvas.width; x += 4) if (data[(y * canvas.width + x) * 4 + 3] > 120) points.push([ox + x, oy + y]);
  }
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [points[i], points[j]] = [points[j], points[i]];
  }
  return points.slice(0, GATHER_COUNT);
}

/** Fireflies fly in from around the title and settle on its glyphs, then fade as the text appears. */
function gather(points: [number, number][], duration: number, color: string) {
  const sprite = glowSprite(color, true);
  const t0 = performance.now();
  const list = points.map(([x, y]) => {
    const a = Math.random() * Math.PI * 2;
    const d = 80 + Math.random() * 240;
    return { sx: x + Math.cos(a) * d, sy: y + Math.sin(a) * d * 0.6, tx: x, ty: y, delay: Math.random() * 380, dur: duration * (0.82 + Math.random() * 0.4), ph: Math.random() * 600 };
  });
  paint((g, now, scroll) => {
    const age = now - t0;
    if (age > duration * 2.3 + 200) return false;
    const fade = age > duration * 1.4 ? clamp(1 - (age - duration * 1.4) / 900, 0, 1) : 1;
    g.globalCompositeOperation = 'lighter';
    for (const p of list) {
      const q = clamp((age - p.delay) / p.dur, 0, 1);
      const a = (q > 0 ? 0.35 + 0.65 * q : 0) * fade * (0.7 + 0.3 * Math.sin((age + p.ph) / 90));
      if (a <= 0.01) continue;
      const e = easeOut(q);
      g.globalAlpha = a;
      g.drawImage(sprite, lerp(p.sx, p.tx, e) - scroll.x - 6, lerp(p.sy, p.ty, e) - scroll.y - 6, 12, 12);
    }
    g.globalCompositeOperation = 'source-over';
    return true;
  });
}

/**
 * Ninefold's title reveal. By day (Glint) the letters grow up from the line,
 * one after another; at night (Gloam) fireflies gather out of the dark into
 * the shape of the words, and the words appear where they settle. The real
 * text never moves (it stays in place, hidden while the effect runs), so
 * nothing reflows. Screen readers always get the final text. `duration` is
 * the night gather's time (default 1100 ms).
 */
export function TextReveal({ text, as: Tag = 'span', className, id, trigger = 'view', duration = 1100, delay = 0 }: TextRevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const baseRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const [cells, setCells] = useState<Cell[] | null>(null);
  const chars = Array.from(text);

  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const play = useCallback(async () => {
    const first = ref.current;
    if (reduced || !first) return;
    await fontReady(first, text);
    const box = ref.current;
    const node = baseRef.current?.firstChild;
    if (!alive.current || !box || !(node instanceof Text)) return;
    const measured = measure(node, box, Array.from(text));
    if (!measured) return;
    if (isNight(box) && typeof baseRef.current?.animate === 'function') {
      const points = glyphPoints(box, Array.from(text), measured);
      if (points.length) {
        baseRef.current.animate([{ opacity: 0 }, { opacity: 0, offset: 0.7 }, { opacity: 1 }], { duration: duration * 1.75, easing: 'ease-out' });
        gather(points, duration, readRoles(box).mote);
        return;
      }
    }
    setCells(measured);
  }, [reduced, text, duration]);

  // By day: once the letters are on screen, grow each one; the base text returns when the last has grown
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!cells || !overlay) return;
    const letters = Array.from(overlay.children) as HTMLElement[];
    if (!letters.length || typeof letters[0].animate !== 'function') {
      setCells(null);
      return;
    }
    const animations = letters.map((el, i) =>
      el.animate(
        [
          { transform: `translateY(0.45em) scaleY(0.2) rotate(${((i % 3) - 1) * 8}deg)`, opacity: 0 },
          { transform: 'translateY(-0.04em) scaleY(1.07)', opacity: 1, offset: 0.62 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: GROW_MS, delay: i * GROW_STAGGER_MS, fill: 'both', easing: 'cubic-bezier(.2,.8,.3,1)' },
      ),
    );
    let live = true;
    Promise.all(animations.map((a) => a.finished)).then(
      () => live && setCells(null),
      () => {},
    );
    return () => {
      live = false;
      animations.forEach((a) => a.cancel());
    };
  }, [cells]);

  useEffect(() => {
    if (trigger === 'mount') {
      const t = window.setTimeout(() => void play(), delay);
      return () => window.clearTimeout(t);
    }
    if (trigger === 'view' && ref.current) {
      let t = 0;
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          t = window.setTimeout(() => void play(), delay);
          io.disconnect();
        },
        { threshold: 0.4 },
      );
      io.observe(ref.current);
      return () => {
        io.disconnect();
        window.clearTimeout(t);
      };
    }
  }, [trigger, play, delay]);

  // Reduced motion turning on mid-run shows the text at once
  if (reduced && cells) setCells(null);

  return (
    <Tag ref={ref} id={id} className={cx(styles.text, className)} onMouseEnter={trigger === 'hover' ? () => void play() : undefined}>
      {/* What assistive tech reads: always the final text (inside buttons and links too) */}
      <span className={styles.sr}>{text}</span>
      <span ref={baseRef} aria-hidden="true" className={cells ? styles.hidden : undefined}>
        {text}
      </span>
      {cells && (
        <span ref={overlayRef} aria-hidden="true" className={styles.overlay}>
          {chars.map((c, i) => {
            const cell = cells[i];
            if (!cell || /\s/.test(c)) return null;
            const style: CSSProperties = { left: cell.left, top: cell.top, width: cell.width, height: cell.height, lineHeight: `${cell.height}px` };
            return (
              <span key={i} className={styles.letter} style={style}>
                {c}
              </span>
            );
          })}
        </span>
      )}
    </Tag>
  );
}
