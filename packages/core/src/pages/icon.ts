import { escapeHtml } from './status';
import { roleValues, shape, type PageTokens } from './theme';

type Corner = 'tl' | 'tr' | 'br' | 'bl';

export type MarkIconOptions = {
  /** The mark: its viewBox (crop it to the drawing) and its <path> elements, which are filled in the on-accent color. */
  mark: { viewBox: string; paths: string };
  /** Where the mark sits on the plate, in the plate's units. Default: centered, half the plate. */
  inset?: { x: number; y: number; width: number; height: number };
  /** The plate's size (its viewBox is 0 0 size size). Default 64. */
  size?: number;
  /** The corner size, in the plate's units, before the library's shape rule (cut and round multiples). Default 12. */
  corner?: number;
  /** Which corners get cut, where the library cuts. Default tl and br, as the corner() mixin. */
  corners?: Corner[];
  /** A palette of the library's; the default if it has none by that id. */
  palette?: string | null;
};

const n = (v: number) => String(Math.round(v * 100) / 100);

/** The plate's outline: cut corners where the library cuts, rounded ones where it rounds. */
function platePath(size: number, cut: number, round: number, corners: Corner[]): string {
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

/**
 * The site's mark as an app icon or favicon (SVG): an accent plate in the
 * library's corner shape, with the mark in the on-accent color, in the light
 * mood (browser tabs and home screens don't switch).
 */
export function renderMarkIcon(tokens: PageTokens, { mark, size = 64, inset, corner = 12, corners = ['tl', 'br'], palette }: MarkIconOptions): string {
  const colors = roleValues(tokens, { scheme: 'light', palette });
  const { cut, round } = shape(tokens);
  const box = inset ?? { x: size / 4, y: size / 4, width: size / 2, height: size / 2 };
  const paths = mark.paths.replace(/<\/path>/g, '').replace(/<path\b([^>]*?)\/?>/g, (_, attrs: string) => `<path fill="${colors['on-accent']}"${attrs.replace(/\s+fill="[^"]*"/g, '').replace(/\s+$/, '')}/>`);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(size)} ${n(size)}">` +
    `<path d="${platePath(size, corner * cut, corner * round, corners)}" fill="${colors.accent}"/>` +
    `<svg x="${n(box.x)}" y="${n(box.y)}" width="${n(box.width)}" height="${n(box.height)}" viewBox="${escapeHtml(mark.viewBox)}">${paths}</svg>` +
    `</svg>`
  );
}
