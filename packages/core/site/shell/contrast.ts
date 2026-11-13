/** WCAG 2.2 relative luminance of a #RRGGBB color. */
export function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two #RRGGBB colors (1 to 21). */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export type Grade = 'AAA' | 'AA' | 'AA large' | 'Fail';

/** WCAG grade for normal-size text. */
export function grade(ratio: number): Grade {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA large';
  return 'Fail';
}

/**
 * The text roles of a mood and what each one sits on: every fg-* and *-text
 * role on the page and its surfaces, and on-accent on the accent fill.
 * fg-subtle is for large text only.
 */
export function textPairs(roles: Record<string, string>): { text: string; on: string; large: boolean }[] {
  const pairs: { text: string; on: string; large: boolean }[] = [];
  const surfaces = ['bg', 'surface', 'surface-raised'].filter((s) => roles[s]);
  for (const name of Object.keys(roles)) {
    const isText = name === 'fg' || name.startsWith('fg-') || name.endsWith('-text');
    if (isText) for (const on of surfaces) pairs.push({ text: name, on, large: name === 'fg-subtle' });
  }
  if (roles['on-accent'] && roles.accent) pairs.push({ text: 'on-accent', on: 'accent', large: false });
  return pairs;
}
