// Small drawing helpers the canvas effects share: role colors, glow sprites,
// leaves and twinkles, a seeded random.

/** The mood roles a canvas effect reads, from the element's place in the page (so a data-scheme scope counts). */
export type Roles = {
  mote: string;
  moteHot: string;
  leaf: string;
  bud: string;
  star: string;
  inkWet: string;
  inkDry: string;
  inkGlow: string;
  wax: string;
  fg: string;
  night: boolean;
};

const NAMES: Record<keyof Omit<Roles, 'night'>, string> = {
  mote: '--r9-mote',
  moteHot: '--r9-mote-hot',
  leaf: '--r9-leaf',
  bud: '--r9-bud',
  star: '--r9-star',
  inkWet: '--r9-ink-wet',
  inkDry: '--r9-ink-dry',
  inkGlow: '--r9-ink-glow',
  wax: '--r9-wax',
  fg: '--r9-fg',
};

/** Reads the roles where `el` sits. Gloam (night) is the dark color scheme. */
export function readRoles(el: Element = document.documentElement): Roles {
  const style = getComputedStyle(el);
  const roles = { night: style.colorScheme === 'dark' } as Roles;
  for (const [key, name] of Object.entries(NAMES)) (roles as Record<string, unknown>)[key] = style.getPropertyValue(name).trim() || '#000000';
  return roles;
}

/** True where `el` shows Gloam, the night mood. */
export function isNight(el: Element = document.documentElement): boolean {
  return getComputedStyle(el).colorScheme === 'dark';
}

/** [r, g, b] of #RGB, #RRGGBB or #RRGGBBAA. */
export function rgbOf(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0) as [number, number, number];
}

/** a mixed toward b by t (0 to 1), as rgb(). */
export function mix(a: string, b: string, t: number): string {
  const x = rgbOf(a);
  const y = rgbOf(b);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
}

const sprites = new Map<string, HTMLCanvasElement>();

/** A soft round glow in a color (hard: a bright core, for fireflies), cached. */
export function glowSprite(hex: string, hard = false): HTMLCanvasElement {
  const key = `${hex}${hard ? 'h' : 's'}`;
  let sprite = sprites.get(key);
  if (sprite) return sprite;
  sprite = document.createElement('canvas');
  const n = 64;
  sprite.width = sprite.height = n;
  const g = sprite.getContext('2d');
  if (g) {
    const rgb = rgbOf(hex).join(',');
    const gradient = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    if (hard) {
      gradient.addColorStop(0, 'rgba(255,255,240,1)');
      gradient.addColorStop(0.1, `rgba(${rgb},0.95)`);
      gradient.addColorStop(0.32, `rgba(${rgb},0.3)`);
    } else {
      gradient.addColorStop(0, `rgba(${rgb},0.9)`);
      gradient.addColorStop(0.35, `rgba(${rgb},0.42)`);
    }
    gradient.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gradient;
    g.fillRect(0, 0, n, n);
  }
  sprites.set(key, sprite);
  return sprite;
}

/** A leaf (a pointed oval) centered on x, y. */
export function drawLeaf(g: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, color: string) {
  g.save();
  g.translate(x, y);
  g.rotate(rotation);
  g.scale(size, size);
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(-6, 0);
  g.quadraticCurveTo(0, -5, 6, 0);
  g.quadraticCurveTo(0, 5, -6, 0);
  g.fill();
  g.restore();
}

/** A four-pointed glint centered on x, y (dew, stars). Uses the current fill. */
export function drawTwinkle(g: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
  const inner = size * 0.28;
  g.save();
  g.translate(x, y);
  g.rotate(rotation);
  g.beginPath();
  g.moveTo(0, -size);
  g.lineTo(inner, -inner);
  g.lineTo(size, 0);
  g.lineTo(inner, inner);
  g.lineTo(0, size);
  g.lineTo(-inner, inner);
  g.lineTo(-size, 0);
  g.lineTo(-inner, -inner);
  g.closePath();
  g.fill();
  g.restore();
}

/** A seeded random in [0, 1): the same seed, the same sequence. */
export function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** True when motion should stop: the system setting or the viewer's Still (data-motion="reduced"). */
export function motionOff(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.documentElement.getAttribute('data-motion') === 'reduced';
}
