// The mark on a plate (an app icon, a favicon, a theme's card picture): the
// drawing only, from colors and a corner rule. No imports, so core's sites
// can load it in Node as it is.

export type Corner = 'tl' | 'tr' | 'br' | 'bl';

export type PlateOptions = {
  /** The mark: its viewBox (crop it to the drawing) and its <path> elements, which are filled in `onAccent`. */
  mark: { viewBox: string; paths: string };
  /** The plate's color, and the mark's. */
  accent: string;
  onAccent: string;
  /** The library's corner rule: how much of the corner size it cuts and rounds (multiples). */
  cut: number;
  round: number;
  /** Where the mark sits on the plate, in the plate's units. Default: centered, half the plate. */
  inset?: { x: number; y: number; width: number; height: number };
  /** The plate's size (its viewBox is 0 0 size size). Default 64. */
  size?: number;
  /** The corner size, in the plate's units, before the corner rule. Default 12. */
  corner?: number;
  /** Which corners get cut, where the library cuts. Default tl and br, as the corner() mixin. */
  corners?: Corner[];
};

const n = (v: number) => String(Math.round(v * 100) / 100);
const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** The plate's outline: cut corners where the library cuts, rounded ones where it rounds. */
export function platePath(size: number, cut: number, round: number, corners: Corner[]): string {
  const S = size;
  const c = (k: Corner) => (cut > 0 && corners.includes(k) ? cut : 0);
  const r = (k: Corner) => (c(k) ? 0 : round);
  let d = `M${n(c('tl') || r('tl'))} 0`;
  d += c('tr') ? `H${n(S - c('tr'))}L${n(S)} ${n(c('tr'))}` : r('tr') ? `H${n(S - r('tr'))}A${n(r('tr'))} ${n(r('tr'))} 0 0 1 ${n(S)} ${n(r('tr'))}` : `H${n(S)}`;
  d += c('br') ? `V${n(S - c('br'))}L${n(S - c('br'))} ${n(S)}` : r('br') ? `V${n(S - r('br'))}A${n(r('br'))} ${n(r('br'))} 0 0 1 ${n(S - r('br'))} ${n(S)}` : `V${n(S)}`;
  d += c('bl') ? `H${n(c('bl'))}L0 ${n(S - c('bl'))}` : r('bl') ? `H${n(r('bl'))}A${n(r('bl'))} ${n(r('bl'))} 0 0 1 0 ${n(S - r('bl'))}` : 'H0';
  d += c('tl') ? `V${n(c('tl'))}` : r('tl') ? `V${n(r('tl'))}A${n(r('tl'))} ${n(r('tl'))} 0 0 1 ${n(r('tl'))} 0` : 'V0';
  return `${d}Z`;
}

/** The mark in `onAccent` on an `accent` plate in the library's corner shape (SVG). */
export function plateSvg({ mark, accent, onAccent, cut, round, inset, size = 64, corner = 12, corners = ['tl', 'br'] }: PlateOptions): string {
  const box = inset ?? { x: size / 4, y: size / 4, width: size / 2, height: size / 2 };
  const paths = mark.paths.replace(/<\/path>/g, '').replace(/<path\b([^>]*?)\/?>/g, (_, attrs: string) => `<path fill="${onAccent}"${attrs.replace(/\s+fill="[^"]*"/g, '').replace(/\s+$/, '')}/>`);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(size)} ${n(size)}">` +
    `<path d="${platePath(size, corner * cut, corner * round, corners)}" fill="${accent}"/>` +
    `<svg x="${n(box.x)}" y="${n(box.y)}" width="${n(box.width)}" height="${n(box.height)}" viewBox="${attr(mark.viewBox)}">${paths}</svg>` +
    `</svg>`
  );
}

/** A mark's SVG source as `mark` for plateSvg: its viewBox and its paths. */
export function markParts(svg: string): { viewBox: string; paths: string } {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 100 100';
  const paths = [...svg.matchAll(/<path\b[^>]*?\/?>/g)].map((m) => m[0]).join('');
  return { viewBox, paths };
}
