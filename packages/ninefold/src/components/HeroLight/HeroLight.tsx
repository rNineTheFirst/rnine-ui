import { useEffect, useRef, type CSSProperties } from 'react';
import { cx } from '@rnine/core/kit';
import { useReducedMotion } from '@rnine/core/motion';
import { clamp, glowSprite, readRoles } from '../../fx/paint';
import { useNight } from '../../fx/useNight';
import styles from './HeroLight.module.scss';

export type HeroLightProps = {
  /** How strong the window light is by day (default 0.6, tuned). */
  window?: number;
  /** How strong the candle glow is at night (default 0.9). */
  glow?: number;
  /** How much the candle flickers, 0 to 1 (default 0.5). */
  flicker?: number;
  /** How many stars over the hero at night (default 0.8). */
  stars?: number;
  className?: string;
};

type Star = { x: number; y: number; ox: number; oy: number; vx: number; vy: number; z: number; s: number; tw: number; ph: number; gold: boolean };

/**
 * Light over a hero. By day, sun through a window falls across it and
 * drifts; at night a candle glows in the corner, breathing, and stars come
 * out across the top, flowing aside when the pointer moves through them.
 * The light leans a little with the pointer. Put it first inside a
 * positioned hero; it fills it and never takes clicks. The window light
 * blends with what's behind it (soft light): keep the hero from being its
 * own stacking context (no z-index or isolation on it) unless it has a background.
 */
export function HeroLight({ window: windowLight = 0.6, glow = 0.9, flicker = 0.5, stars = 0.8, className }: HeroLightProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const night = useNight(ref);

  // The light leans toward the pointer (the window away from it)
  useEffect(() => {
    const layer = ref.current;
    const host = layer?.parentElement;
    if (!layer || !host || reduced) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const step = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      layer.style.setProperty('--hx', `${x.toFixed(2)}px`);
      layer.style.setProperty('--hy', `${y.toFixed(2)}px`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.2 ? requestAnimationFrame(step) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const m = -18;
      tx = ((e.clientX - (r.left + r.width / 2)) / r.width) * m;
      ty = ((e.clientY - (r.top + r.height / 2)) / r.height) * m * 0.6;
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onLeave = () => {
      tx = ty = 0;
      if (!raf) raf = requestAnimationFrame(step);
    };
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  // Night sky: stars over the top of the hero, a current behind the pointer
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = ref.current?.parentElement;
    const g = canvas?.getContext('2d');
    if (!night || !canvas || !host || !g) return;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let list: Star[] = [];
    let raf = 0;
    let visible = true;
    let roles = readRoles(canvas);
    const P = { x: -9999, y: -9999, vx: 0, vy: 0, on: false, t: 0 };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      const n = clamp(Math.round(((W * H) / 2600) * stars), 10, 260);
      list = Array.from({ length: n }, () => {
        const depth = Math.random();
        const z = depth < 0.5 ? 0.35 : depth < 0.83 ? 0.62 : 1;
        // More stars higher up, fading toward the bottom of the sky
        return { x: Math.random() * W, y: Math.random() ** 1.4 * H, ox: 0, oy: 0, vx: 0, vy: 0, z, s: (0.45 + Math.random() * 0.6) * (0.7 + z * 0.9), tw: 0.0008 + Math.random() * 0.002, ph: Math.random() * 6.283, gold: Math.random() < 0.25 };
      });
    };
    const draw = (t: number, k: number) => {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
      const pvx = P.vx * 16.7;
      const pvy = P.vy * 16.7;
      const speed = Math.hypot(pvx, pvy);
      for (const s of list) {
        if (k > 0) {
          const x = s.x + s.ox;
          const y = s.y + s.oy;
          if (P.on && speed > 0.05) {
            const d = Math.hypot(x - P.x, y - P.y) || 1;
            if (d < 260) {
              const f = (1 - d / 260) ** 2 * s.z;
              const side = pvx * (y - P.y) - pvy * (x - P.x) > 0 ? 1 : -1;
              s.vx += (pvx * 0.09 - ((y - P.y) / d) * speed * 0.03 * side) * f * k;
              s.vy += (pvy * 0.09 + ((x - P.x) / d) * speed * 0.03 * side) * f * k;
            }
          }
          s.vx += -s.ox * 0.01 * k;
          s.vy += -s.oy * 0.01 * k;
          s.vx *= 0.95 ** k;
          s.vy *= 0.95 ** k;
          s.ox += s.vx * k;
          s.oy += s.vy * k;
        }
        const fade = clamp(1 - s.y / H, 0, 1) ** 1.3;
        const a = 0.55 * (0.62 + 0.38 * Math.sin(t * s.tw + s.ph)) * fade;
        const x = s.x + s.ox;
        const y = s.y + s.oy;
        g.globalAlpha = Math.min(1, a);
        g.fillStyle = s.gold ? roles.mote : roles.star;
        g.beginPath();
        g.arc(x, y, s.s, 0, Math.PI * 2);
        g.fill();
        if (s.z === 1 && s.s > 1.2) {
          const size = s.s * 9;
          g.globalAlpha = Math.min(1, a) * 0.5;
          g.drawImage(glowSprite(s.gold ? roles.mote : roles.star), x - size / 2, y - size / 2, size, size);
        }
      }
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
    };
    let last = 0;
    const loop = (t: number) => {
      const dt = last ? Math.min(50, t - last) : 16.7;
      last = t;
      if (visible && !document.hidden) draw(t, dt / 16.7);
      P.vx *= 0.88;
      P.vy *= 0.88;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const now = performance.now();
      const dt = Math.max(8, now - P.t);
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (P.on && now - P.t < 120) {
        P.vx = P.vx * 0.5 + ((x - P.x) / dt) * 0.5;
        P.vy = P.vy * 0.5 + ((y - P.y) / dt) * 0.5;
      }
      P.x = x;
      P.y = y;
      P.t = now;
      P.on = true;
    };
    const onLeave = () => {
      P.on = false;
    };
    resize();
    roles = readRoles(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(host);
    if (reduced) {
      draw(0, 0);
      return () => {
        ro.disconnect();
        io.disconnect();
      };
    }
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [night, reduced, stars]);

  const vars = { '--r9-window': windowLight, '--r9-glow': glow, '--r9-flicker': flicker } as CSSProperties;
  return (
    <span ref={ref} className={cx(styles.light, className)} style={vars} aria-hidden="true">
      {night ? (
        <>
          <span className={styles.candle} />
          <canvas ref={canvasRef} className={styles.sky} />
        </>
      ) : (
        <span className={styles.window} />
      )}
    </span>
  );
}
