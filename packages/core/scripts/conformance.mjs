// Conformance checks every library runs in its own tests
// (import "@rnine/core/conformance"), so a brand can replace another by
// changing the import only.
export { contractProblems } from './build-tokens.mjs';

function luminance(hex) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio of two #RRGGBB colors. */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** [text role, background roles, minimum ratio]: WCAG 2.2 AA for every library's moods. */
export const CONTRAST_PAIRS = [
  ['fg', ['bg', 'surface', 'surface-raised'], 4.5],
  ['fg-muted', ['bg', 'surface', 'surface-raised'], 4.5],
  ['accent-text', ['bg', 'surface'], 4.5],
  ['signal-text', ['bg', 'surface'], 4.5],
  ['success', ['bg', 'surface'], 4.5],
  ['warning', ['bg', 'surface'], 4.5],
  ['danger', ['bg', 'surface'], 4.5],
  ['on-accent', ['accent', 'accent-hover'], 4.5],
  ['inverse-fg', ['inverse-bg'], 4.5],
  // Large text / non-text UI only
  ['fg-subtle', ['bg'], 3],
  ['accent', ['bg', 'surface'], 3],
  ['signal', ['bg', 'surface'], 3],
  ['line-strong', ['bg'], 1.5],
  ['scrollbar-thumb', ['bg', 'surface'], 1.5],
  ['scrollbar-thumb-hover', ['bg', 'surface'], 3],
];

/**
 * Every contrast check for built tokens: [{ palette, scheme, fg, bg, min, ratio, ok }].
 * With palettes, every palette in every mood (palette is null without any).
 */
export function contrastChecks(tokens) {
  const checks = [];
  const views = tokens.palettes?.length ? tokens.palettes.map((p) => [p.id, p.schemes]) : [[null, tokens.schemes]];
  for (const [palette, schemes] of views) {
    for (const [scheme, roles] of Object.entries(schemes)) {
      const color = Object.fromEntries(roles.map((r) => [r.name, r.value]));
      for (const [fg, bgs, min] of CONTRAST_PAIRS) {
        for (const bg of bgs) {
          const ratio = contrast(color[fg], color[bg]);
          checks.push({ palette, scheme, fg, bg, min, ratio, ok: ratio >= min, fgValue: color[fg], bgValue: color[bg] });
        }
      }
    }
  }
  return checks;
}

/**
 * Exports of `core` (a module namespace) that `library` lacks. Every library
 * exports all of core's names, so an app can switch libraries by import.
 */
export function missingExports(core, library) {
  return Object.keys(core).filter((name) => !(name in library));
}

/** The shared keyframe names core's keyframes() helper and base.css define. */
export const CORE_KEYFRAMES = ['reveal', 'pulse', 'blink', 'sheen'];
