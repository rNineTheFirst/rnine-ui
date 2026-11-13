import { useEffect, useRef } from 'react';
import { RIPPLE_EVENT, useReducedMotion, type BackdropProps, type RippleDetail } from '@rnine/core/motion';
import { cx } from '@rnine/core/kit';
import { clamp, drawLeaf, glowSprite, mix, readRoles, type Roles } from '../fx/paint';
import styles from './Backdrop.module.scss';

/** The tuned feel (round 3). Counts are per area; `gap` scales them. */
const FIREFLIES = 0.5; // how many
const GLOW = 0.5; // how bright
const PULL = 0.1; // how strongly they circle the pointer
const SCATTER = 0.2; // how far a quick move scatters them
const WAVE_MS = 5000; // an idle flash wave this often
const IDLE_MS = 5200; // after the pointer rests this long
const LEAVES = 0.4; // how many
const LEAF_SIZE = 0.6;

type Ripple = { x: number; y: number; t0: number; speed: number; life: number; idle: boolean };
type Fly = { x: number; y: number; vx: number; vy: number; a: number; per: number; ph: number; sz: number; heat: number; flash: number; dir: number; ro: number };
type Leaf = { x: number; y: number; vx: number; vy: number; sz: number; tone: number; rot: number; vr: number; ph: number; heat: number };

const band = (r: Ripple, x: number, y: number, t: number, width: number) => {
  const off = Math.abs(Math.hypot(x - r.x, y - r.y) - ((t - r.t0) / 1000) * r.speed);
  return off < width ? (1 - off / width) * (1 - (t - r.t0) / r.life) : 0;
};

// A firefly's own slow blink: a quick rise, a hold, a long fade
const blink = (f: Fly, t: number) => {
  const p = ((t + f.ph) % f.per) / f.per;
  if (p < 0.07) return 0.12 + 0.88 * (p / 0.07);
  if (p < 0.15) return 1;
  if (p < 0.4) return 1 - 0.88 * ((p - 0.15) / 0.25);
  return 0.12;
};

/**
 * Ninefold's backdrop: falling leaves by day (Glint), fireflies by night
 * (Gloam). Fireflies circle the pointer, scatter when it moves quickly,
 * flash in a ring from a click or tap (and from rippleAt), and flash in
 * slow waves when the pointer rests. Leaves drift down and the pointer
 * is a breeze through them. With reduced motion it's a still scene.
 */
export function Backdrop({ gap = 22, reach = 175, fixed = false }: BackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const layer = canvas?.parentElement;
    const host = layer?.parentElement;
    if (!canvas || !layer || !host) return;
    const g = canvas.getContext('2d');
    if (!g) return;

    const density = (22 / Math.max(6, gap)) ** 2;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let roles: Roles = readRoles(canvas);
    const flies: Fly[] = [];
    const leaves: Leaf[] = [];
    let ripples: Ripple[] = [];
    const P = { x: -9999, y: -9999, cx: 0, cy: 0, vx: 0, vy: 0, on: false, t: 0 };
    let lastMove = 0;
    let lastIdle = 0;
    let lastScroll = window.scrollY;
    let visible = true;
    let raf = 0;
    let last = 0;
    let frame = 0;

    const newFly = (): Fly => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, a: Math.random() * 6.283, per: 2600 + Math.random() * 2800, ph: Math.random() * 6000, sz: 0.7 + Math.random() * 0.8, heat: 0, flash: 0, dir: Math.random() < 0.5 ? -1 : 1, ro: 34 + Math.random() * 50 });
    const newLeaf = (): Leaf => ({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, sz: 0.6 + Math.random() * 0.9, tone: Math.random(), rot: Math.random() * 6.283, vr: (Math.random() - 0.5) * 0.01, ph: Math.random() * 9000, heat: 0 });
    const populate = () => {
      const nf = clamp(Math.round(((W * H) / 7400) * FIREFLIES * density), 10, 220);
      const nl = clamp(Math.round(((W * H) / 8800) * LEAVES * density), 8, 180);
      while (flies.length < nf) flies.push(newFly());
      while (leaves.length < nl) leaves.push(newLeaf());
      flies.length = nf;
      leaves.length = nl;
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (W * H * dpr * dpr > 4.8e6) dpr = Math.sqrt(4.8e6 / (W * H || 1));
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      populate();
    };
    const wrap = (o: { x: number; y: number }, pad: number) => {
      if (o.x < -pad) o.x = W + pad;
      else if (o.x > W + pad) o.x = -pad;
      if (o.y < -pad) o.y = H + pad;
      else if (o.y > H + pad) o.y = -pad;
    };
    const ripple = (x: number, y: number, idle = false) => {
      ripples.push({ x, y, t0: performance.now(), speed: idle ? 330 : 470, life: idle ? 3400 : 2400, idle });
      kick();
    };

    const drawFlies = (t: number, k: number, scrollDY: number) => {
      const near = P.on ? { x: P.x, y: P.y } : { x: -9999, y: -9999 };
      const fast = Math.hypot(P.vx, P.vy) > 0.95;
      const sprite = glowSprite(roles.mote, true);
      const hot = glowSprite(roles.moteHot, true);
      g.globalCompositeOperation = 'lighter';
      for (const f of flies) {
        if (k > 0) {
          f.a += (Math.random() - 0.5) * 0.32 * k;
          f.vx += Math.cos(f.a) * 0.011 * k;
          f.vy += Math.sin(f.a) * 0.011 * k;
          const dx = near.x - f.x;
          const dy = near.y - f.y;
          const d = Math.hypot(dx, dy) || 1;
          const inReach = d < reach;
          if (inReach) {
            const ux = dx / d;
            const uy = dy / d;
            const s = 1 - d / reach;
            if (fast && d < reach * 0.75) {
              f.vx -= ux * 1.5 * s * k * SCATTER;
              f.vy -= uy * 1.5 * s * k * SCATTER;
              f.flash = Math.max(f.flash, 0.45);
            } else {
              const pull = clamp((d - f.ro) / f.ro, -1, 1);
              const m = (0.4 + s) * k * PULL;
              f.vx += (ux * pull * 0.055 - uy * 0.042 * f.dir) * m;
              f.vy += (uy * pull * 0.055 + ux * 0.042 * f.dir) * m;
            }
            f.heat += (Math.min(1, s * 1.7) - f.heat) * 0.1 * k;
          } else f.heat *= 0.95 ** k;
          for (const r of ripples) {
            const w = band(r, f.x, f.y, t, 28);
            if (w <= 0) continue;
            f.flash = Math.max(f.flash, w);
            if (!r.idle) {
              const rd = Math.hypot(f.x - r.x, f.y - r.y) || 1;
              f.vx += ((f.x - r.x) / rd) * 0.3 * w;
              f.vy += ((f.y - r.y) / rd) * 0.3 * w;
            }
          }
          f.flash *= 0.93 ** k;
          f.vx *= 0.975 ** k;
          f.vy *= 0.975 ** k;
          const v = Math.hypot(f.vx, f.vy);
          const lim = inReach ? (fast ? 4 : 1.7) : 0.6;
          if (v > lim) {
            f.vx *= lim / v;
            f.vy *= lim / v;
          }
          f.x += f.vx * k;
          f.y += f.vy * k - scrollDY * 0.22;
          wrap(f, 24);
        }
        const glow = Math.max(blink(f, t) * 0.8, f.heat * 0.95, f.flash) * GLOW;
        const size = 26 * f.sz * (1 + 0.45 * f.heat + 0.5 * f.flash);
        g.globalAlpha = glow * (1 - f.heat * 0.75);
        g.drawImage(sprite, f.x - size / 2, f.y - size / 2, size, size);
        if (f.heat > 0.04 || f.flash > 0.04) {
          g.globalAlpha = Math.max(f.heat, f.flash * 0.5);
          g.drawImage(hot, f.x - size / 2, f.y - size / 2, size, size);
        }
      }
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
    };

    const drawLeaves = (t: number, k: number, scrollDY: number) => {
      const R = reach + 5;
      const px = P.on ? P.x : -9999;
      const py = P.on ? P.y : -9999;
      const wind = 0.1 + 0.07 * Math.sin(t / 5200);
      const pvx = P.vx * 16.7;
      const pvy = P.vy * 16.7;
      const tinted = mix(roles.leaf, roles.mote, 0.55);
      for (const p of leaves) {
        if (k > 0) {
          p.vx += (wind - p.vx) * 0.008 * k;
          p.vy += (Math.sin((t + p.ph) / 1700) * 0.004 + 0.001) * k;
          const dx = p.x - px;
          const dy = p.y - py;
          const d = Math.hypot(dx, dy) || 1;
          if (d < R) {
            const s = 1 - d / R;
            p.vx += ((dx / d) * 0.05 + pvx * 0.035) * s * k;
            p.vy += ((dy / d) * 0.05 + pvy * 0.035) * s * k;
            p.vr += pvx * 0.0008 * s;
            p.heat += (s - p.heat) * 0.1 * k;
          } else p.heat *= 0.95 ** k;
          for (const r of ripples) {
            const w = band(r, p.x, p.y, t, 34);
            if (w <= 0) continue;
            const rd = Math.hypot(p.x - r.x, p.y - r.y) || 1;
            const f = r.idle ? 0.35 : 1.1;
            p.vx += ((p.x - r.x) / rd) * f * w;
            p.vy += ((p.y - r.y) / rd) * f * w;
            p.vr += 0.02 * w;
            p.heat = Math.max(p.heat, w);
          }
          p.vx *= 0.985 ** k;
          p.vy *= 0.985 ** k;
          p.vr *= 0.99;
          // Falling: a steady drop, a sway, a slow turn
          p.vy += (0.32 - p.vy) * 0.012 * k;
          p.vx += Math.sin((t + p.ph) / 900) * 0.006 * k;
          p.rot += Math.sin((t + p.ph) / 650) * 0.012 * k + p.vr * k;
          p.x += p.vx * k;
          p.y += p.vy * k - scrollDY * 0.18;
          wrap(p, 20);
        }
        g.globalAlpha = 0.7 + p.heat * 0.25;
        drawLeaf(g, p.x, p.y, (0.75 + p.sz * 0.45) * LEAF_SIZE * (1 + p.heat * 0.25), p.rot, p.tone < 0.7 ? roles.leaf : tinted);
      }
      g.globalAlpha = 1;
    };

    const draw = (t: number, dt: number) => {
      if (frame++ % 30 === 0) roles = readRoles(canvas);
      const k = dt / 16.7;
      const sy = window.scrollY;
      const scrollDY = fixed ? 0 : sy - lastScroll;
      lastScroll = sy;
      P.vx *= 0.88;
      P.vy *= 0.88;
      ripples = ripples.filter((r) => t - r.t0 < r.life);
      if (k > 0 && t - lastMove > IDLE_MS && t - lastIdle > WAVE_MS && !ripples.length) {
        lastIdle = t;
        ripple(Math.random() * W, Math.random() * H * 0.8, true);
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      if (roles.night) drawFlies(t, k, scrollDY);
      else drawLeaves(t, k, scrollDY);
    };

    const loop = (t: number) => {
      raf = 0;
      const dt = last ? Math.min(50, t - last) : 16.7;
      last = t;
      if (visible && !document.hidden) draw(t, dt);
      kick();
    };
    function kick() {
      if (!raf && !reduced) raf = requestAnimationFrame(loop);
    }

    const origin = () => canvas.getBoundingClientRect();
    const onMove = (e: PointerEvent) => {
      const o = origin();
      const now = performance.now();
      const dt = Math.max(8, now - P.t);
      if (P.on && now - P.t < 120) {
        P.vx = P.vx * 0.5 + ((e.clientX - P.cx) / dt) * 0.5;
        P.vy = P.vy * 0.5 + ((e.clientY - P.cy) / dt) * 0.5;
      }
      P.cx = e.clientX;
      P.cy = e.clientY;
      P.x = e.clientX - o.left;
      P.y = e.clientY - o.top;
      P.t = now;
      P.on = true;
      lastMove = now;
    };
    const onLeave = () => {
      P.on = false;
    };
    // A lifted finger shouldn't keep the fireflies around it
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') window.setTimeout(onLeave, 600);
    };
    const onDown = (e: PointerEvent) => {
      const o = origin();
      ripple(e.clientX - o.left, e.clientY - o.top);
    };
    const onRipple = (e: Event) => {
      const { x, y } = (e as CustomEvent<RippleDetail>).detail;
      const o = origin();
      ripple(x - o.left, y - o.top);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(fixed ? document.documentElement : host);
    const io = new IntersectionObserver(([e]) => {
      visible = fixed || e.isIntersecting;
    });
    io.observe(host);

    if (reduced) {
      // A still scene, redrawn when the mood changes
      const still = () => {
        roles = readRoles(canvas);
        draw(0, 0);
      };
      still();
      const mo = new MutationObserver(still);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-scheme', 'data-palette'] });
      return () => {
        ro.disconnect();
        io.disconnect();
        mo.disconnect();
      };
    }

    const target: Window | HTMLElement = fixed ? window : host;
    const opts = { passive: true } as const;
    target.addEventListener('pointermove', onMove as EventListener, opts);
    target.addEventListener('pointerdown', onDown as EventListener, opts);
    target.addEventListener('pointerup', onUp as EventListener, opts);
    (fixed ? document.documentElement : host).addEventListener('pointerleave', onLeave);
    window.addEventListener(RIPPLE_EVENT, onRipple);
    kick();
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

  return (
    <span className={cx(styles.layer, fixed && styles.fixed)} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </span>
  );
}
