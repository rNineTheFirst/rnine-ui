// The trail's winding path, in a 1000 x 120 box, and points along it by
// length. Computed here (three cubic curves), not with the SVG DOM, so it
// works anywhere.

export const TRAIL_D = 'M24 70C140 18 230 112 350 64S570 22 670 70 870 112 980 52';
export const TRAIL_W = 1000;
export const TRAIL_H = 120;

type Pt = [number, number];
// The same curves as TRAIL_D, with the S commands' first control points reflected
const SEGMENTS: [Pt, Pt, Pt, Pt][] = [
  [[24, 70], [140, 18], [230, 112], [350, 64]],
  [[350, 64], [470, 16], [570, 22], [670, 70]],
  [[670, 70], [770, 118], [870, 112], [980, 52]],
];

const at = ([a, b, c, d]: [Pt, Pt, Pt, Pt], t: number): Pt => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k]) as Pt;
};

// Points every few units along the path, with the length walked to each
const SAMPLES: { p: Pt; len: number }[] = [];
{
  let len = 0;
  let prev: Pt | null = null;
  for (const seg of SEGMENTS) {
    for (let i = prev ? 1 : 0; i <= 160; i++) {
      const p = at(seg, i / 160);
      if (prev) len += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      SAMPLES.push({ p, len });
      prev = p;
    }
  }
}

/** The path's length, in box units. */
export const TRAIL_LENGTH = SAMPLES[SAMPLES.length - 1].len;

function index(len: number): number {
  let lo = 0;
  let hi = SAMPLES.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (SAMPLES[mid].len < len) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** The point `len` units along the path. */
export function pointAt(len: number): Pt {
  const i = index(Math.max(0, Math.min(TRAIL_LENGTH, len)));
  if (i === 0) return SAMPLES[0].p;
  const a = SAMPLES[i - 1];
  const b = SAMPLES[i];
  const t = b.len === a.len ? 0 : (len - a.len) / (b.len - a.len);
  return [a.p[0] + (b.p[0] - a.p[0]) * t, a.p[1] + (b.p[1] - a.p[1]) * t];
}

/** The path walked so far, as SVG path data (a polyline through the samples). */
export function walkedD(len: number): string {
  const end = index(Math.max(0, Math.min(TRAIL_LENGTH, len)));
  const points = SAMPLES.slice(0, end).map((s) => s.p);
  points.push(pointAt(len));
  return `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}`;
}

/** Where each of `n` stops sits along the path, as a length: spread from 7% to 93%. */
export function stopLengths(n: number): number[] {
  if (n <= 1) return [TRAIL_LENGTH * 0.5];
  return Array.from({ length: n }, (_, i) => TRAIL_LENGTH * (0.07 + (0.86 * i) / (n - 1)));
}
