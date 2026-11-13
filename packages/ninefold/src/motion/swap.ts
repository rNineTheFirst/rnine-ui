// "Swarm swap": Ninefold's panel swap (swapIn/swapOut). At night the old
// panel dissolves into fireflies and the new one gathers out of them; by day
// leaves blow off the old panel and drift in to the new. The panels animate
// with the Web Animations API (nothing is left on them when it ends); the
// fireflies and leaves fly on the page's effects overlay. No-ops where
// element.animate is missing; with reduced motion, a plain cut.
import { spawn, leafColor, type Particle } from '../fx/overlay';
import { motionOff, readRoles } from '../fx/paint';

/** The tuned feel (round 3): how many fly, and the swap's speed (1 = the base timings). */
const SWARM = 80;
const PACE = 0.8;

/** Duration of the exit, in ms. The next panel enters after it. */
export const SWAP_OUT_MS = Math.round(360 * PACE);
/** Duration of the entrance: the swarm settles, then the panel clears. */
export const SWAP_IN_MS = Math.round((260 + 540) * PACE);

const EASE = 'cubic-bezier(.2,.7,.2,1)';

function canAnimate(el: Element): boolean {
  return typeof (el as HTMLElement).animate === 'function';
}

function swarm(el: HTMLElement, count: number, leaving: boolean) {
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const roles = readRoles(el);
  const ox = r.left + window.scrollX;
  const oy = r.top + window.scrollY;
  const list: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const x = ox + Math.random() * r.width;
    const y = oy + Math.random() * r.height;
    const base = { roles, phase: Math.random() * 900, size: 0.6 + Math.random() * 0.5, rot: Math.random() * Math.PI * 2, life: 0 };
    if (roles.night) {
      if (leaving) list.push({ ...base, kind: 'fly', x, y, vx: (Math.random() - 0.5) * 2.4, vy: -0.4 - Math.random() * 1.6, max: (600 + Math.random() * 700) * PACE, drag: 0.985 });
      else {
        const a = Math.random() * Math.PI * 2;
        const d = 30 + Math.random() * 110;
        list.push({ ...base, kind: 'fly', x, y, from: { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d }, to: { x, y }, dur: (420 + Math.random() * 360) * PACE, max: (760 + Math.random() * 300) * PACE });
      }
    } else {
      // Leaves: blown off to the right, or carried in from the left
      const leaf = { ...base, kind: 'leaf' as const, size: 0.7 + Math.random() * 0.5, color: leafColor(roles, Math.random()) };
      if (leaving) list.push({ ...leaf, x, y, vx: 1.4 + Math.random() * 2.6, vy: -0.8 + Math.random() * 0.9, vr: (Math.random() - 0.5) * 0.2, max: (600 + Math.random() * 700) * PACE, drag: 0.985 });
      else list.push({ ...leaf, x, y, from: { x: x - 60 - Math.random() * 140, y: y + (Math.random() - 0.5) * 60 }, to: { x, y }, dur: (420 + Math.random() * 360) * PACE, max: (760 + Math.random() * 300) * PACE });
    }
  }
  spawn(list);
}

/** Exit: the panel blurs away as its swarm lifts off. Resolves when it has finished (at once without WAAPI). */
export function swapOut(el: HTMLElement): Promise<void> {
  if (!canAnimate(el) || motionOff()) return Promise.resolve();
  swarm(el, SWARM, true);
  const animation = el.animate([{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(5px)' }], { duration: SWAP_OUT_MS, easing: EASE, fill: 'forwards' });
  return new Promise((resolve) => {
    animation.onfinish = () => resolve();
    animation.oncancel = () => resolve();
  });
}

/** Entrance: the swarm flies in and settles, then the panel clears out of it. `scanbar` is NineOS's; Ninefold ignores it. */
export function swapIn(el: HTMLElement, scanbar?: HTMLElement | null): void {
  void scanbar;
  if (!canAnimate(el) || motionOff()) return;
  swarm(el, Math.round(SWARM * 0.88), false);
  const wait = 260 * PACE;
  el.animate([{ opacity: 0, filter: 'blur(5px)' }, { opacity: 0, filter: 'blur(5px)', offset: wait / SWAP_IN_MS }, { opacity: 1, filter: 'blur(0px)' }], { duration: SWAP_IN_MS, easing: EASE });
}
