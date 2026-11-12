/** Name of the window event every Backdrop that reacts listens to. */
export const RIPPLE_EVENT = 'r9:ripple';

export type RippleDetail = { x: number; y: number };

/**
 * Sends a ripple through every reacting Backdrop on the page (NineOS: the dot field), from a point in
 * viewport coordinates. Use it to answer an action, e.g. at the button that
 * ran a command:
 *
 *   const r = button.getBoundingClientRect();
 *   rippleAt(r.left + r.width / 2, r.top);
 */
export function rippleAt(x: number, y: number): void {
  window.dispatchEvent(new CustomEvent<RippleDetail>(RIPPLE_EVENT, { detail: { x, y } }));
}
