// The seal's geometry, shared by Mark (live) and the brand kit's seal download
// (a still SVG). All in a 100 x 100 box.

/** The seal's outline: a disc of wax with a soft, uneven edge (seeded, the same every time). */
export const WAX =
  'M96 50C96.6 53.1 96.7 56.7 95.9 59.7C95 62.8 92.3 65.4 90.7 68.1C89 70.8 87.8 73.7 85.9 76.1C84 78.5 81.4 80.1 79.2 82.5C77.1 84.8 75.7 88.3 73.2 90.1C70.7 92 67.3 93.3 64.2 93.8C61.1 94.3 57.7 93.1 54.5 93.2C51.4 93.3 48.4 94.5 45.3 94.4C42.3 94.3 39.3 93.2 36.2 92.6C33 91.9 29.2 92.1 26.6 90.6C23.9 89 22 85.7 20.2 83.1C18.3 80.5 17.6 77.5 15.5 75.1C13.4 72.7 9.5 71.4 7.8 68.8C6.2 66.2 6.1 62.6 5.6 59.4C5.1 56.3 4.4 53.1 4.7 50C5 46.9 6.7 44 7.4 40.9C8.2 37.9 8.4 34.9 9.2 31.8C10 28.7 10.2 24.9 12 22.4C13.7 19.8 17.1 18.2 19.8 16.4C22.5 14.7 25.4 13.5 28.2 12.2C30.9 10.8 33.5 9.3 36.4 8.1C39.2 6.9 42.2 5.9 45.3 5.2C48.4 4.4 51.9 3 54.9 3.6C57.9 4.2 60.5 7.4 63.4 8.8C66.3 10.1 69.4 10.3 72.2 11.5C75.1 12.8 77.9 14.4 80.4 16.2C82.9 18.1 85.4 20.4 87.3 22.9C89.2 25.4 90.8 28.4 91.6 31.5C92.4 34.5 91.3 38 92 41.1C92.7 44.2 95.3 46.9 96 50Z';
/** One leaf of the sprig, pointing right from its base. */
export const LEAF = 'M0 0Q6 -5 13 0Q6 5 0 0Z';
/** The sprig's two branches behind the seal: their angle and length. */
export const BRANCHES = [
  { rotate: -38, length: 50 },
  { rotate: 150, length: 46 },
] as const;
/** Where the leaves sit along a branch (0 = the center, 1 = its tip). */
export const LEAF_STOPS = [0.42, 0.62, 0.8, 0.96] as const;
/** The pressed ring's radius. */
export const RING = 31.5;
/** The mark's box inside the seal: left/top and size, in the 100-unit box. */
export const ART = { at: 30, size: 39, highlight: 0.6 } as const;

/** A leaf's transform on a branch of this length. */
export const leafTransform = (length: number, t: number, i: number) =>
  `translate(${(50 - length * t).toFixed(1)} 50) rotate(${180 + (i % 2 ? 1 : -1) * 42}) scale(${(1 - t * 0.35).toFixed(2)})`;

export type SealColors = { wax: string; waxLight: string; waxDark: string; leaf: string };

/**
 * The seal as a still SVG: the sprig, the wax, the pressed ring and a mark
 * embossed in it (SVG source with filled paths; its viewBox is kept).
 */
export function sealSvg(colors: SealColors, markSvg: string, size = 512): string {
  const viewBox = markSvg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 100 100';
  const paths = [...markSvg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
  const art = (fill: string, opacity: number, shift: number) =>
    `<svg x="${ART.at + shift}" y="${ART.at + shift}" width="${ART.size}" height="${ART.size}" viewBox="${viewBox}"><g fill="${fill}" opacity="${opacity}">${paths.map((d) => `<path d="${d}"/>`).join('')}</g></svg>`;
  const branches = BRANCHES.map(
    ({ rotate, length }) =>
      `<g transform="rotate(${rotate} 50 50)"><path d="M50 50L${50 - length} 50" fill="none" stroke="${colors.leaf}" stroke-width="1.6" stroke-linecap="round"/>${LEAF_STOPS.map((t, i) => `<path d="${LEAF}" fill="${colors.leaf}" transform="${leafTransform(length, t, i)}"/>`).join('')}</g>`,
  ).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 112 112" width="${size}" height="${size}">
<defs><radialGradient id="wax" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="${colors.waxLight}"/><stop offset="0.45" stop-color="${colors.wax}"/><stop offset="1" stop-color="${colors.waxDark}"/></radialGradient></defs>
<g id="sprig">${branches}</g>
<path id="wax-disc" d="${WAX}" fill="url(#wax)"/>
<circle cx="50" cy="50" r="${RING}" fill="${colors.waxDark}" opacity="0.28"/>
<circle cx="50" cy="50" r="${RING}" fill="none" stroke="${colors.waxDark}" stroke-width="1.4" opacity="0.7"/>
<g id="your-mark">${art(colors.waxLight, 0.55, ART.highlight * ART.size / 100)}${art(colors.waxDark, 1, 0)}</g>
</svg>
`;
}
