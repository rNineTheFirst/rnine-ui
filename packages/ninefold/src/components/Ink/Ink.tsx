import { useEffect, useRef, useState } from 'react';
import { cx } from '@rnine/core/kit';
import { useFinePointer, useReducedMotion } from '@rnine/core/motion';
import { spawn } from '../../fx/overlay';
import { clamp, mix, readRoles, type Roles } from '../../fx/paint';
import { isPaper } from './paper';
import styles from './Ink.module.scss';

export type InkProps = {
  /** How long the ink stays before it fades, in seconds (default 1, tuned). */
  stays?: number;
  /** Pen width in px (default 2). */
  width?: number;
  /** On touch, how long to press before writing, in ms (default 300), so scrolling still works. */
  hold?: number;
  /**
   * A one-time hint (once per browser session) that the page can be written
   * on. Default: an English line for mouse or for touch; false for none.
   */
  hint?: string | false;
  className?: string;
};

type Point = { x: number; y: number; w: number; t: number };
type Stroke = { pts: Point[]; done: boolean; end: number; path: Path2D | null; roles: Roles };

const NIB = -0.6; // the broad nib's angle: strokes across it are thick, along it thin
const HINT_KEY = 'r9-ink-hint';

/**
 * Write on the page: drag across empty paper (on touch, press and hold
 * first) and a broad-nib pen writes in wet ink that dries and fades after
 * a moment. Opt-in: put it inside the area that can be written on (it
 * fills its nearest positioned parent). Writing starts only on paper: never
 * on text (a drag there selects it, as usual), links, buttons, fields or
 * cards, nor inside [data-ink-off]. Off with reduced motion. Purely
 * decorative: nothing is kept.
 */
export function Ink({ stays = 1, width = 2, hold = 300, hint, className }: InkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const [hintOn, setHintOn] = useState(false);
  const hintText = hint === false ? null : hint ?? (fine ? 'Psst: drag on the empty paper to write. The ink fades.' : 'Psst: press and hold on empty paper, then write.');

  useEffect(() => {
    const canvas = canvasRef.current;
    const layer = canvas?.parentElement;
    const host = layer?.parentElement;
    const g = canvas?.getContext('2d');
    if (!canvas || !layer || !host || !g || reduced) return;

    let strokes: Stroke[] = [];
    let current: Stroke | null = null;
    let writing = false;
    let raf = 0;
    let dpr = 1;
    let W = 0;
    let H = 0;
    let hinted = false;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      kick();
    };
    // Strokes are kept in the host's coordinates, so they stay on the page as it scrolls
    const local = (x: number, y: number) => {
      const r = host.getBoundingClientRect();
      return { x: x - r.left, y: y - r.top };
    };

    const shape = (s: Stroke) => {
      const { pts } = s;
      const path = new Path2D();
      const n = pts.length;
      path.moveTo(pts[0].x + width * 0.6, pts[0].y);
      path.arc(pts[0].x, pts[0].y, width * 0.6, 0, Math.PI * 2);
      if (n < 2) return path;
      const left: [number, number][] = [];
      const right: [number, number][] = [];
      for (let i = 0; i < n; i++) {
        const a = pts[Math.max(0, i - 1)];
        const b = pts[Math.min(n - 1, i + 1)];
        const tl = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const nx = -(b.y - a.y) / tl;
        const ny = (b.x - a.x) / tl;
        const hw = pts[i].w / 2;
        left.push([pts[i].x + nx * hw, pts[i].y + ny * hw]);
        right.push([pts[i].x - nx * hw, pts[i].y - ny * hw]);
      }
      path.moveTo(left[0][0], left[0][1]);
      for (let j = 1; j < n; j++) path.lineTo(left[j][0], left[j][1]);
      for (let m = n - 1; m >= 0; m--) path.lineTo(right[m][0], right[m][1]);
      path.closePath();
      return path;
    };

    const draw = (t: number) => {
      raf = 0;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      const off = canvas.getBoundingClientRect();
      const hr = host.getBoundingClientRect();
      g.translate(hr.left - off.left, hr.top - off.top);
      const stay = stays * 1000;
      strokes = strokes.filter((s) => {
        const age = s.done ? t - s.end : 0;
        const wet = s.done ? clamp(1 - age / Math.min(1100, stay * 0.45), 0, 1) : 1;
        const alpha = s.done ? (age < stay ? 1 : clamp(1 - (age - stay) / 800, 0, 1)) : 1;
        if (alpha <= 0) return false;
        s.path ??= shape(s);
        g.globalAlpha = alpha * 0.93;
        g.fillStyle = mix(s.roles.inkDry, s.roles.inkWet, wet);
        g.shadowColor = s.roles.inkGlow;
        g.shadowBlur = s.roles.night ? 12 * wet : 0;
        g.fill(s.path, 'nonzero');
        return true;
      });
      g.globalAlpha = 1;
      g.shadowBlur = 0;
      if (strokes.length) kick();
    };
    function kick() {
      if (!raf) raf = requestAnimationFrame(draw);
    }

    const penDown = (x: number, y: number) => {
      const p = local(x, y);
      current = { pts: [{ ...p, w: width * 0.8, t: performance.now() }], done: false, end: 0, path: null, roles: readRoles(host) };
      strokes.push(current);
      window.getSelection()?.removeAllRanges();
      if (hinted || hintText) setHintOn(false);
      kick();
    };
    const penMove = (x: number, y: number) => {
      if (!current) return;
      const p = local(x, y);
      const prev = current.pts[current.pts.length - 1];
      const dx = p.x - prev.x;
      const dy = p.y - prev.y;
      const d = Math.hypot(dx, dy);
      if (d < 1.8) return;
      const now = performance.now();
      const speed = d / Math.max(1, now - prev.t);
      const nib = 0.32 + 0.68 * Math.abs(Math.sin(Math.atan2(dy, dx) - NIB));
      const w = width * nib * clamp(1.3 - speed * 0.34, 0.45, 1.3);
      current.pts.push({ ...p, w: prev.w * 0.55 + w * 0.45, t: now });
      current.path = null;
      kick();
    };
    const penUp = () => {
      if (!current) return;
      const n = current.pts.length;
      // The stroke tapers as the pen lifts
      for (let i = 1; i <= Math.min(4, n - 1); i++) current.pts[n - i].w *= 0.35 + 0.16 * i;
      current.done = true;
      current.end = performance.now();
      current.path = null;
      current = null;
      kick();
    };

    // Mouse and pen: a drag that starts on paper writes (and never selects)
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.button !== 0 || !isPaper(e.target, e.clientX, e.clientY)) return;
      e.preventDefault();
      writing = true;
      penDown(e.clientX, e.clientY);
      try {
        host.setPointerCapture(e.pointerId);
      } catch {
        // The pointer may already be gone
      }
    };
    const onMove = (e: PointerEvent) => {
      if (writing) penMove(e.clientX, e.clientY);
    };
    const onUp = () => {
      if (!writing) return;
      writing = false;
      penUp();
    };
    const noSelect = (e: Event) => {
      if (writing) e.preventDefault();
    };

    // Touch: press and hold on paper, then write; a move before that scrolls as usual
    let press: { x: number; y: number; ready: boolean; started: boolean; timer: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (e.touches.length !== 1 || !isPaper(e.target, t.clientX, t.clientY)) return;
      press = {
        x: t.clientX,
        y: t.clientY,
        ready: false,
        started: false,
        timer: window.setTimeout(() => {
          if (!press) return;
          press.ready = true;
          spawn([{ kind: 'ring', x: press.x + window.scrollX, y: press.y + window.scrollY, life: 0, max: 520, roles: readRoles(host) }]);
        }, hold),
      };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!press) return;
      const t = e.touches[0];
      if (press.ready) {
        e.preventDefault();
        if (!press.started) {
          press.started = true;
          writing = true;
          penDown(press.x, press.y);
        }
        penMove(t.clientX, t.clientY);
      } else if (Math.abs(t.clientX - press.x) + Math.abs(t.clientY - press.y) > 10) {
        window.clearTimeout(press.timer);
        press = null;
      }
    };
    const onTouchEnd = () => {
      if (!press) return;
      window.clearTimeout(press.timer);
      if (press.started) {
        writing = false;
        penUp();
      }
      press = null;
    };

    // The hint, once per session, a moment after the paper comes into view
    let hintTimer = 0;
    let hintOff = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || !hintText) return;
      io.disconnect();
      try {
        if (sessionStorage.getItem(HINT_KEY)) return;
        sessionStorage.setItem(HINT_KEY, '1');
      } catch {
        // Storage blocked: show it anyway
      }
      hintTimer = window.setTimeout(() => {
        hinted = true;
        setHintOn(true);
        hintOff = window.setTimeout(() => setHintOn(false), 7000);
      }, 1200);
    });
    io.observe(host);

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    window.addEventListener('scroll', kick, { passive: true });
    host.addEventListener('pointerdown', onDown);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerup', onUp);
    host.addEventListener('pointercancel', onUp);
    document.addEventListener('selectstart', noSelect);
    host.addEventListener('touchstart', onTouchStart, { passive: true });
    host.addEventListener('touchmove', onTouchMove, { passive: false });
    host.addEventListener('touchend', onTouchEnd);
    host.addEventListener('touchcancel', onTouchEnd);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hintTimer);
      window.clearTimeout(hintOff);
      if (press) window.clearTimeout(press.timer);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', kick);
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerup', onUp);
      host.removeEventListener('pointercancel', onUp);
      document.removeEventListener('selectstart', noSelect);
      host.removeEventListener('touchstart', onTouchStart);
      host.removeEventListener('touchmove', onTouchMove);
      host.removeEventListener('touchend', onTouchEnd);
      host.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [reduced, stays, width, hold, hintText]);

  return (
    <span className={cx(styles.layer, className)} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      {hintText && <span className={cx(styles.hint, hintOn && styles.on)}>{hintText}</span>}
    </span>
  );
}
