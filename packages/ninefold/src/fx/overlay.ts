// One page-wide canvas above everything, for short-lived particles: click
// bursts, the swarm swap, the lantern's trail, the fireflies that gather a
// title. Created on first use; its frame loop runs only while something is
// on it. Particles live in page coordinates, so they stay where they were
// made when the page scrolls.
import { clamp, drawLeaf, drawTwinkle, easeOut, glowSprite, lerp, mix, type Roles } from './paint';

export type Particle = {
  kind: 'leaf' | 'fly' | 'dust' | 'twinkle' | 'ring';
  /** Page coordinates */
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  /** Age and lifetime in ms (a negative age waits) */
  life: number;
  max: number;
  /** Flying to a target (page coordinates) over `dur` ms instead of drifting */
  from?: { x: number; y: number };
  to?: { x: number; y: number };
  dur?: number;
  size?: number;
  rot?: number;
  vr?: number;
  drag?: number;
  /** Falls (leaves) */
  gravity?: number;
  color?: string;
  phase?: number;
  roles: Roles;
};

/** A drawing that runs each frame until it returns false (e.g. a title gathering). */
export type Painter = (g: CanvasRenderingContext2D, now: number, scroll: { x: number; y: number }) => boolean;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let raf = 0;
let last = 0;
let dpr = 1;
let particles: Particle[] = [];
let painters: Painter[] = [];

function ensure(): CanvasRenderingContext2D | null {
  if (ctx && canvas?.isConnected) return ctx;
  if (typeof document === 'undefined') return null;
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:var(--r9-z-fx,70)';
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  if (!ctx) return null;
  fit();
  return ctx;
}

/**
 * Sizes the bitmap to the canvas's own box (the viewport less any scrollbar:
 * innerWidth counts a classic scrollbar, which would squeeze every drawing
 * sideways) at the device's pixel ratio. Checked each frame, since a
 * scrollbar can come and go without a resize.
 */
function fit(): { w: number; h: number } {
  if (!canvas) return { w: 0, h: 0 };
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const bw = Math.round(w * dpr);
  const bh = Math.round(h * dpr);
  if (canvas.width !== bw) canvas.width = bw;
  if (canvas.height !== bh) canvas.height = bh;
  return { w, h };
}

function frame(now: number) {
  raf = 0;
  const g = ctx;
  if (!g || !canvas) return;
  const dt = last ? Math.min(50, now - last) : 16.7;
  last = now;
  const k = dt / 16.7;
  const scroll = { x: window.scrollX, y: window.scrollY };
  const view = fit();
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, view.w, view.h);

  particles = particles.filter((p) => (p.life += dt) <= p.max);
  for (const p of particles) {
    if (p.life < 0) continue;
    const q = p.life / p.max;
    const fade = q > 0.72 ? 1 - (q - 0.72) / 0.28 : 1;
    let alpha = fade;
    if (p.to && p.from && p.dur) {
      const e = easeOut(clamp(p.life / p.dur, 0, 1));
      p.x = lerp(p.from.x, p.to.x, e);
      p.y = lerp(p.from.y, p.to.y, e);
      alpha = Math.sin(Math.PI * clamp(q, 0, 1));
    } else {
      const drag = (p.drag ?? 0.97) ** k;
      p.vx = (p.vx ?? 0) * drag;
      p.vy = (p.vy ?? 0) * drag + (p.gravity ?? 0) * k;
      if (p.kind === 'leaf') p.vx += Math.sin(p.life / 130) * 0.05 * k;
      p.x += p.vx * k;
      p.y += p.vy * k;
      p.rot = (p.rot ?? 0) + (p.vr ?? 0) * k;
    }
    const x = p.x - scroll.x;
    const y = p.y - scroll.y;
    const r = p.roles;
    if (p.kind === 'leaf') {
      g.globalAlpha = alpha;
      if (p.to) p.rot = (p.rot ?? 0) + 0.05 * k;
      drawLeaf(g, x, y, p.size ?? 1, p.rot ?? 0, p.color ?? r.leaf);
    } else if (p.kind === 'fly') {
      const blink = 0.55 + 0.45 * Math.sin((p.life + (p.phase ?? 0)) / 140);
      const size = 22 * (p.size ?? 1);
      g.globalCompositeOperation = r.night ? 'lighter' : 'source-over';
      g.globalAlpha = alpha * blink;
      g.drawImage(glowSprite(r.mote, r.night), x - size / 2, y - size / 2, size, size);
      g.globalCompositeOperation = 'source-over';
    } else if (p.kind === 'dust') {
      g.globalAlpha = alpha;
      g.fillStyle = p.color ?? r.star;
      const s = p.size ?? 1;
      g.beginPath();
      g.arc(x, y, s, 0, Math.PI * 2);
      g.fill();
      if (s > 1.6) {
        g.fillRect(x - s * 2.2, y - 0.35, s * 4.4, 0.7);
        g.fillRect(x - 0.35, y - s * 2.2, 0.7, s * 4.4);
      }
    } else if (p.kind === 'twinkle') {
      const s = Math.sin(Math.PI * q);
      g.globalAlpha = s;
      g.fillStyle = p.color ?? r.star;
      drawTwinkle(g, x, y, (p.size ?? 5) * s + 0.5, q * 1.6);
    } else if (p.kind === 'ring') {
      g.globalAlpha = 1 - q;
      g.strokeStyle = p.color ?? r.inkWet;
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(x, y, 8 + q * 26, 0, Math.PI * 2);
      g.stroke();
    }
  }
  painters = painters.filter((paint) => paint(g, now, scroll));
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';

  if (particles.length || painters.length) raf = requestAnimationFrame(frame);
  else last = 0;
}

function kick() {
  if (!raf) raf = requestAnimationFrame(frame);
}

/** Puts particles on the overlay. */
export function spawn(list: Particle[]) {
  if (!list.length || !ensure()) return;
  particles.push(...list);
  kick();
}

/** Runs a drawing on the overlay each frame until it returns false. */
export function paint(painter: Painter) {
  if (!ensure()) return;
  painters.push(painter);
  kick();
}

/** A leaf's color: mostly the leaf role, some tinted gold. */
export function leafColor(roles: Roles, tone: number): string {
  return tone < 0.7 ? roles.leaf : mix(roles.leaf, roles.mote, 0.55);
}
