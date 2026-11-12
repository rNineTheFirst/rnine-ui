// "Signal swap": NineOS's panel swap (swapIn/swapOut). Runs with the Web
// Animations API, so nothing (classes, inline styles) is left on the element
// when it ends. Both helpers are no-ops where element.animate is missing.

const EASE = 'cubic-bezier(.2,.7,.2,1)';

/** Duration of the exit, in ms. The next panel enters after it. */
export const SWAP_OUT_MS = 220;
/** Duration of the entrance reveal, in ms. */
export const SWAP_IN_MS = 500;

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function canAnimate(el: Element): boolean {
  return typeof (el as HTMLElement).animate === 'function';
}

/**
 * Exit: a quick cyan/magenta RGB split while the element slides 6px and
 * fades. Never scales. Resolves when it has finished (at once without WAAPI).
 */
export function swapOut(el: HTMLElement): Promise<void> {
  if (!canAnimate(el)) return Promise.resolve();
  const signal = token('--r9-signal');
  const accent = token('--r9-accent');
  const animation = el.animate(
    [
      { opacity: 1, transform: 'translateX(0)', filter: 'none' },
      { offset: 0.35, opacity: 1, transform: 'translateX(3px)', filter: `drop-shadow(-3px 0 ${signal}) drop-shadow(3px 0 ${accent})` },
      { opacity: 0, transform: 'translateX(-6px)', filter: `drop-shadow(-6px 0 ${signal}) drop-shadow(6px 0 ${accent})` },
    ],
    { duration: SWAP_OUT_MS, easing: EASE, fill: 'forwards' },
  );
  return new Promise((resolve) => {
    animation.onfinish = () => resolve();
    animation.oncancel = () => resolve();
  });
}

/**
 * Entrance: the element is revealed top-down (its clip-path follows the
 * NineOS card cut), its children rise 8px in a short stagger, and an
 * optional scan bar runs down with the reveal.
 */
export function swapIn(el: HTMLElement, scanbar?: HTMLElement | null): void {
  if (!canAnimate(el)) return;
  el.animate(
    [{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }, { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }],
    { duration: SWAP_IN_MS, easing: EASE },
  );
  Array.from(el.children).forEach((child, i) => {
    if (!canAnimate(child)) return;
    (child as HTMLElement).animate(
      [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 450, delay: Math.min(i, 4) * 60, easing: EASE, fill: 'backwards' },
    );
  });
  if (scanbar && canAnimate(scanbar)) {
    // Down the stage with transform (not top): no layout work, no layout shift
    const height = scanbar.parentElement?.getBoundingClientRect().height ?? 0;
    scanbar.animate(
      [{ transform: 'translateY(0)', opacity: 1 }, { offset: 0.9, opacity: 1 }, { transform: `translateY(${height}px)`, opacity: 0 }],
      { duration: SWAP_IN_MS, easing: EASE },
    );
  }
}
