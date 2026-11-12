import { useEffect, useRef } from 'react';
import type { BackdropProps } from '@rnine/core/motion';
import { useReducedMotion } from '@rnine/core/motion';
import { cx } from '@rnine/core/kit';
import { RIPPLE_EVENT, type RippleDetail } from '@rnine/core/motion';
import styles from './DotField.module.scss';


type Ripple = { x: number; y: number; t: number };

/**
 * A grid of dots that reacts to the pointer: dots near it grow, push away and
 * turn magenta. When the pointer rests, a cyan ripple crosses the field now
 * and then; a click or tap sends one, and so does rippleAt(x, y) from code.
 * On touch, dragging stirs the dots.
 */
export function Backdrop({ gap = 22, reach = 150, fixed = false }: BackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let colors = { dot: '', hot: '', ripple: '' };
    const pointer = { x: -9999, y: -9999 };
    let ripples: Ripple[] = [];
    let lastMove = 0;
    let visible = true;
    let raf = 0;
    let frame = 0;

    const readColors = () => {
      const s = getComputedStyle(canvas);
      colors = {
        dot: s.getPropertyValue('--r9-dot').trim(),
        hot: s.getPropertyValue('--r9-accent').trim(),
        ripple: s.getPropertyValue('--r9-signal').trim(),
      };
    };
    // Where the field's top-left corner sits in the viewport
    const origin = () => (fixed ? { left: 0, top: 0 } : host.getBoundingClientRect());
    const resize = () => {
      const r = fixed ? { width: window.innerWidth, height: window.innerHeight } : host.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      if (frame++ % 30 === 0) readColors();
      ctx.clearRect(0, 0, w, h);
      if (!reduced && now - lastMove > 5000 && (!ripples.length || now - ripples[ripples.length - 1].t > 5500)) {
        ripples.push({ x: Math.random() * w, y: Math.random() * h * 0.8, t: now });
      }
      ripples = ripples.filter((r) => now - r.t < 2600);

      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const d = Math.hypot(dx, dy);
          const k = d < reach ? 1 - d / reach : 0;
          let px = x;
          let py = y;
          let size = 1;
          let wave = 0;
          if (k > 0) {
            px += (dx / (d || 1)) * k * 6;
            py += (dy / (d || 1)) * k * 6;
            size = 1 + k * 1.4;
          }
          for (const r of ripples) {
            const age = (now - r.t) / 2600;
            const off = Math.abs(Math.hypot(x - r.x, y - r.y) - age * 520);
            if (off < 26) {
              const s = (1 - off / 26) * (1 - age);
              wave = Math.max(wave, s * 0.8);
              size = Math.max(size, 1 + s * 1.2);
            }
          }
          if (k > 0.05) {
            ctx.fillStyle = colors.hot;
            ctx.globalAlpha = Math.min(1, 0.2 + k);
          } else if (wave > 0.05) {
            ctx.fillStyle = colors.ripple;
            ctx.globalAlpha = Math.min(1, 0.25 + wave);
          } else {
            ctx.fillStyle = colors.dot;
            ctx.globalAlpha = 1;
          }
          ctx.fillRect(px - size / 2, py - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      if (visible && !document.hidden) draw(now);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const o = origin();
      pointer.x = e.clientX - o.left;
      pointer.y = e.clientY - o.top;
      lastMove = performance.now();
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
    };
    // A lifted finger shouldn't leave the dots pushed aside
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') window.setTimeout(onLeave, 600);
    };
    const onDown = (e: PointerEvent) => {
      const o = origin();
      ripples.push({ x: e.clientX - o.left, y: e.clientY - o.top, t: performance.now() });
    };
    const onRipple = (e: Event) => {
      const { x, y } = (e as CustomEvent<RippleDetail>).detail;
      const o = origin();
      ripples.push({ x: x - o.left, y: y - o.top, t: performance.now() });
    };
    const target: Window | HTMLElement = fixed ? window : host;

    resize();
    readColors();
    const ro = new ResizeObserver(resize);
    ro.observe(fixed ? document.documentElement : host);
    const io = new IntersectionObserver(([e]) => {
      visible = fixed || e.isIntersecting;
    });
    io.observe(host);

    if (reduced) {
      draw(0);
      // Still redraw static dots when the mood changes
      const mo = new MutationObserver(() => {
        readColors();
        draw(0);
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-scheme', 'data-palette'] });
      return () => {
        ro.disconnect();
        io.disconnect();
        mo.disconnect();
      };
    }

    const opts = { passive: true } as const;
    target.addEventListener('pointermove', onMove as EventListener, opts);
    target.addEventListener('pointerdown', onDown as EventListener, opts);
    target.addEventListener('pointerup', onUp as EventListener, opts);
    (fixed ? document.documentElement : host).addEventListener('pointerleave', onLeave);
    window.addEventListener(RIPPLE_EVENT, onRipple);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      target.removeEventListener('pointermove', onMove as EventListener);
      target.removeEventListener('pointerdown', onDown as EventListener);
      target.removeEventListener('pointerup', onUp as EventListener);
      (fixed ? document.documentElement : host).removeEventListener('pointerleave', onLeave);
      window.removeEventListener(RIPPLE_EVENT, onRipple);
    };
  }, [gap, reach, reduced, fixed]);

  return <canvas ref={canvasRef} className={cx(styles.field, fixed && styles.fixed)} aria-hidden="true" />;
}
