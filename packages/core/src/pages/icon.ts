import { plateSvg, type Corner } from './plate';
import { roleValues, shape, type PageTokens } from './theme';

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

/**
 * The site's mark as an app icon or favicon (SVG): an accent plate in the
 * library's corner shape, with the mark in the on-accent color, in the light
 * mood (browser tabs and home screens don't switch).
 */
export function renderMarkIcon(tokens: PageTokens, { mark, size = 64, inset, corner = 12, corners = ['tl', 'br'], palette }: MarkIconOptions): string {
  const colors = roleValues(tokens, { scheme: 'light', palette });
  const { cut, round } = shape(tokens);
  return plateSvg({ mark, accent: colors.accent, onAccent: colors['on-accent'], cut, round, inset, size, corner, corners });
}
