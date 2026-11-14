// NineSync's content swap: lift. The old content fades out (120ms); the new
// content rises 6px into place as it fades in (220ms). Runs with the Web
// Animations API, so nothing is left on the element when it ends. No-ops
// where element.animate is missing.

/** Duration of the exit, in ms. The next content enters after it. */
export const SWAP_OUT_MS = 120;
/** Duration of the entrance, in ms. */
export const SWAP_IN_MS = 220;

const EASE = 'cubic-bezier(.2,.7,.2,1)';

const canAnimate = (el: Element) => typeof (el as HTMLElement).animate === 'function';

/** Exit: the content fades out. Resolves when it has finished (at once without WAAPI). */
export function swapOut(el: HTMLElement): Promise<void> {
  if (!canAnimate(el)) return Promise.resolve();
  const animation = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: SWAP_OUT_MS, easing: 'ease-out', fill: 'forwards' });
  return new Promise((resolve) => {
    animation.onfinish = () => resolve();
    animation.oncancel = () => resolve();
  });
}

/** Entrance: the content rises 6px into place, fading in. `scanbar` is for libraries that run one; NineSync ignores it. */
export function swapIn(el: HTMLElement, scanbar?: HTMLElement | null): void {
  void scanbar;
  if (!canAnimate(el)) return;
  // End swapOut's held opacity first
  for (const a of el.getAnimations?.() ?? []) a.cancel();
  el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: SWAP_IN_MS, easing: EASE });
}
