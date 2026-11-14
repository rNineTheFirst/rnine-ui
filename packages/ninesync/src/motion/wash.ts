// Feedback after a save: what changed gets a pale wash that fades over 1.2s,
// and a badge or count that changed pops once. Web Animations API: nothing
// is left on the element. No-ops with reduced motion or without WAAPI.

/** How long the wash takes to fade, in ms. */
export const WASH_MS = 1200;

const reduced = () =>
  document.documentElement.dataset.motion === 'reduced' ||
  (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);

/**
 * Washes `el` in the pale tone, fading back over 1.2s. For a table row, its
 * cells are washed (rows don't paint backgrounds in every browser).
 *
 *   await save(order);
 *   wash(rowRef.current);
 */
export function wash(el: HTMLElement | null | undefined): void {
  if (!el || reduced() || typeof el.animate !== 'function') return;
  const targets = el instanceof HTMLTableRowElement ? [...el.cells] : [el];
  const tone = getComputedStyle(el).getPropertyValue('--r9-mark-soft').trim();
  if (!tone) return;
  for (const t of targets) {
    const rest = getComputedStyle(t).backgroundColor;
    t.animate([{ backgroundColor: tone }, { backgroundColor: rest }], { duration: WASH_MS, easing: 'ease-out' });
  }
}

/** A badge or count that changed pops once (scales to 118% and back, 300ms). */
export function pop(el: HTMLElement | null | undefined): void {
  if (!el || reduced() || typeof el.animate !== 'function') return;
  el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
}
