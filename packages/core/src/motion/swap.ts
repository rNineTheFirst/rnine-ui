// The panel swap: the transition between panels (each library brings its own;
// NineOS's is the signal swap). Runs with the Web Animations API, so nothing
// is left on the element when it ends. No-ops where element.animate is missing.

/** Duration of the exit, in ms. The next panel enters after it. */
export const SWAP_OUT_MS = 160;
/** Duration of the entrance, in ms. */
export const SWAP_IN_MS = 260;

const EASE = 'cubic-bezier(.2,.7,.2,1)';

function canAnimate(el: Element): boolean {
  return typeof (el as HTMLElement).animate === 'function';
}

/** Exit: a short fade. Resolves when it has finished (at once without WAAPI). */
export function swapOut(el: HTMLElement): Promise<void> {
  if (!canAnimate(el)) return Promise.resolve();
  const animation = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: SWAP_OUT_MS, easing: EASE, fill: 'forwards' });
  return new Promise((resolve) => {
    animation.onfinish = () => resolve();
    animation.oncancel = () => resolve();
  });
}

/** Entrance: a short fade in. `scanbar` is for libraries that run one; Plain ignores it. */
export function swapIn(el: HTMLElement, scanbar?: HTMLElement | null): void {
  void scanbar;
  if (!canAnimate(el)) return;
  el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: SWAP_IN_MS, easing: EASE });
}
