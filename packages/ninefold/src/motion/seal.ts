// The seal's geometry, shared by Mark (live) and the brand kit's seal download
// (a still SVG). All in a 100 x 100 box. The look is "poured" wax: a raised lip
// with a sheen, a pressed well with a bevel, the mark pressed in with a lit edge,
// a faint grain on large seals. Small seals (40px and below) drop the gloss and
// show the mark's simplified version, smaller and lighter, so it stays readable.

/** The seal's outline: a disc of wax with a soft, uneven edge (seeded, the same every time). */
export const WAX =
  'M96 50C96.6 53.1 96.7 56.7 95.9 59.7C95 62.8 92.3 65.4 90.7 68.1C89 70.8 87.8 73.7 85.9 76.1C84 78.5 81.4 80.1 79.2 82.5C77.1 84.8 75.7 88.3 73.2 90.1C70.7 92 67.3 93.3 64.2 93.8C61.1 94.3 57.7 93.1 54.5 93.2C51.4 93.3 48.4 94.5 45.3 94.4C42.3 94.3 39.3 93.2 36.2 92.6C33 91.9 29.2 92.1 26.6 90.6C23.9 89 22 85.7 20.2 83.1C18.3 80.5 17.6 77.5 15.5 75.1C13.4 72.7 9.5 71.4 7.8 68.8C6.2 66.2 6.1 62.6 5.6 59.4C5.1 56.3 4.4 53.1 4.7 50C5 46.9 6.7 44 7.4 40.9C8.2 37.9 8.4 34.9 9.2 31.8C10 28.7 10.2 24.9 12 22.4C13.7 19.8 17.1 18.2 19.8 16.4C22.5 14.7 25.4 13.5 28.2 12.2C30.9 10.8 33.5 9.3 36.4 8.1C39.2 6.9 42.2 5.9 45.3 5.2C48.4 4.4 51.9 3 54.9 3.6C57.9 4.2 60.5 7.4 63.4 8.8C66.3 10.1 69.4 10.3 72.2 11.5C75.1 12.8 77.9 14.4 80.4 16.2C82.9 18.1 85.4 20.4 87.3 22.9C89.2 25.4 90.8 28.4 91.6 31.5C92.4 34.5 91.3 38 92 41.1C92.7 44.2 95.3 46.9 96 50Z';
/** The pressed well's radius. */
export const RING = 32;
/** At this size (px) and below, the seal is the small one. */
export const SMALL_PX = 40;
/**
 * The mark's box inside the seal (a square, centered), and its lit edge's offset.
 * Small seals give it about half the well's width, so it has room to breathe.
 */
export const ART = {
  large: { size: 40, lit: 0.9 },
  small: { size: 34, lit: 0 },
} as const;
/** The specular highlight on the lip, top left. */
export const SHEEN = { cx: 31, cy: 20, rx: 9, ry: 3.5, rotate: -28 } as const;
/** Grain only shows on large seals (px). */
export const GRAIN_PX = 48;

/** Where the mark's box starts, for a box of this size. */
export const artAt = (size: number) => 50 - size / 2;

/** A mark's viewBox and path data, from its SVG source (filled paths). */
export function parseMark(svg: string): { viewBox: string; paths: string[] } {
  return {
    viewBox: svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 100 100',
    paths: [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]),
  };
}

export type SealColors = { wax: string; waxLight: string; waxDark: string };

/** A specular highlight is white light, whatever the mood (Mark's sheen and foil glint too). */
const SPECULAR = '#fff';

/**
 * The seal as a still SVG, large (poured, with grain) or small: the wax and
 * a mark pressed into it (SVG source with filled paths; its viewBox is kept).
 */
export function sealSvg(colors: SealColors, markSvg: string, { small = false, size = 512 } = {}): string {
  const { viewBox, paths } = parseMark(markSvg);
  const box = small ? ART.small : ART.large;
  const at = artAt(box.size);
  const art = (fill: string, opacity: number, shift: number) =>
    `<svg x="${at + shift}" y="${at + shift}" width="${box.size}" height="${box.size}" viewBox="${viewBox}"><g fill="${fill}" opacity="${opacity}">${paths.map((d) => `<path d="${d}"/>`).join('')}</g></svg>`;
  const body = small
    ? `<circle cx="50" cy="50" r="${RING}" fill="${colors.waxDark}" opacity="0.28"/>
<circle cx="50" cy="50" r="${RING}" fill="none" stroke="${colors.waxDark}" stroke-width="1.4" opacity="0.7"/>
<g id="your-mark">${art(colors.waxLight, 0.95, 0)}</g>`
    : `<path d="${WAX}" fill="none" stroke="url(#lip)" stroke-width="5" clip-path="url(#edge)"/>
<circle cx="50" cy="50" r="${RING}" fill="${colors.waxDark}" opacity="0.22"/>
<circle cx="50" cy="50" r="${RING}" fill="none" stroke="url(#bevel)" stroke-width="2.6"/>
<ellipse cx="${SHEEN.cx}" cy="${SHEEN.cy}" rx="${SHEEN.rx}" ry="${SHEEN.ry}" fill="${SPECULAR}" opacity="0.22" transform="rotate(${SHEEN.rotate} ${SHEEN.cx} ${SHEEN.cy})" filter="url(#soft)"/>
<rect width="100" height="100" filter="url(#grain)" clip-path="url(#edge)" opacity="0.09"/>
<g id="your-mark">${art(colors.waxLight, 0.8, box.lit)}${art(colors.waxDark, 1, 0)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
<defs>
<radialGradient id="wax" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="${colors.waxLight}"/><stop offset="0.45" stop-color="${colors.wax}"/><stop offset="1" stop-color="${colors.waxDark}"/></radialGradient>
<linearGradient id="bevel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${colors.waxDark}" stop-opacity="0.85"/><stop offset="0.5" stop-color="${colors.waxDark}" stop-opacity="0"/><stop offset="1" stop-color="${colors.waxLight}" stop-opacity="0.75"/></linearGradient>
<linearGradient id="lip" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${SPECULAR}" stop-opacity="0.5"/><stop offset="0.45" stop-color="${SPECULAR}" stop-opacity="0"/></linearGradient>
<clipPath id="edge"><path d="${WAX}"/></clipPath>
${small ? '' : `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0"/></filter>
<filter id="soft"><feGaussianBlur stdDeviation="2.2"/></filter>`}
</defs>
<path id="wax-disc" d="${WAX}" fill="url(#wax)"/>
${body}
</svg>
`;
}
