// The screen entry: a cascade. The children of an element marked
// data-cascade rise 8px and fade in, 40ms apart, when it appears; table rows
// inside fade in 18ms apart. PageEffects watches the page for them, so a
// screen only has to mark its content.

const EASE = 'cubic-bezier(.2,.7,.2,1)';
/** Gap between blocks, in ms. */
export const CASCADE_STEP_MS = 40;
/** Gap between table rows, in ms. */
export const CASCADE_ROW_MS = 18;
/** At most this many blocks (and rows) stagger; the rest arrive with the last. */
const MAX = 12;

const reduced = () =>
  document.documentElement.dataset.motion === 'reduced' ||
  (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);

/** Plays the cascade on one container's children (and the rows of tables in it). */
export function cascade(container: HTMLElement): void {
  if (reduced() || typeof container.animate !== 'function') return;
  const blocks = [...container.children].filter((el): el is HTMLElement => el instanceof HTMLElement);
  blocks.forEach((el, i) => {
    el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], {
      duration: 260,
      delay: Math.min(i, MAX) * CASCADE_STEP_MS,
      easing: EASE,
      fill: 'backwards',
    });
  });
  const start = Math.min(blocks.length, MAX) * CASCADE_STEP_MS;
  container.querySelectorAll<HTMLElement>('tbody tr').forEach((row, i) => {
    row.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: start + Math.min(i, MAX) * CASCADE_ROW_MS, easing: 'ease-out', fill: 'backwards' });
  });
}

/**
 * Watches the document for elements marked data-cascade and plays the
 * cascade on each as it's added (and on those already there). Returns the
 * function that stops watching.
 */
export function watchCascades(root: ParentNode = document): () => void {
  const played = new WeakSet<Element>();
  const run = (el: Element) => {
    if (played.has(el)) return;
    played.add(el);
    cascade(el as HTMLElement);
  };
  root.querySelectorAll('[data-cascade]').forEach(run);
  if (typeof MutationObserver === 'undefined') return () => {};
  const observer = new MutationObserver((records) => {
    for (const r of records) {
      r.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.hasAttribute('data-cascade')) run(node);
        node.querySelectorAll('[data-cascade]').forEach(run);
      });
    }
  });
  observer.observe(root instanceof Document ? root.body : (root as Node), { childList: true, subtree: true });
  return () => observer.disconnect();
}
