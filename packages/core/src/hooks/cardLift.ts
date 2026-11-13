import { useEffect, type RefObject } from 'react';
import { useTheme } from '../provider/ThemeProvider';
import { useReducedMotion } from './motion';

/** How a library's cards lift their cut corner toward the pointer (ThemeConfig lift). */
export type CardLift = {
  /** How far the cut grows at most, in px, on top of the card's own cut (shape.card-cut). */
  by: number;
  /** How far from the card's top-right corner the pointer starts lifting it, in px. */
  reach: number;
  /** How fast the cut follows the pointer: the share of the way it moves each frame (at 60 fps), 0 to 1. */
  follow: number;
};

type Entry = { el: HTMLElement; lift: CardLift; reduced: boolean; cur: number; target: number; hold: number };

/** Counts as near the card this far outside it, in px. */
const PAD = 24;
/** A tap lifts the corner for this long, in ms. */
const TAP_HOLD = 2400;

const cards = new Set<Entry>();
let raf = 0;
let last = 0;

function aim(entry: Entry, x: number, y: number) {
  const r = entry.el.getBoundingClientRect();
  const near = x > r.left - PAD && x < r.right + PAD && y > r.top - PAD && y < r.bottom + PAD;
  if (near) {
    const d = Math.hypot(r.right - x, y - r.top);
    entry.target = entry.lift.by * (1 - Math.min(1, d / entry.lift.reach)) ** 1.6;
  } else if (!entry.hold) entry.target = 0;
}

function step(t: number) {
  raf = 0;
  const k = last ? Math.min(50, t - last) / 16.7 : 1;
  last = t;
  let moving = false;
  for (const entry of cards) {
    const before = entry.cur;
    if (entry.reduced) entry.cur = entry.target > entry.lift.by / 2 ? entry.lift.by : 0;
    else entry.cur += (entry.target - entry.cur) * Math.min(1, entry.lift.follow * k);
    if (Math.abs(entry.target - entry.cur) < 0.3) entry.cur = entry.target;
    else moving = true;
    if (entry.cur !== before) entry.el.style.setProperty('--r9-card-lift', `${entry.cur.toFixed(1)}px`);
  }
  if (moving) kick();
  else last = 0;
}

function kick() {
  if (!raf) raf = requestAnimationFrame(step);
}

function onMove(e: PointerEvent) {
  if (e.pointerType === 'touch') return;
  for (const entry of cards) aim(entry, e.clientX, e.clientY);
  kick();
}

function onLeave() {
  for (const entry of cards) if (!entry.hold) entry.target = 0;
  kick();
}

// Touch has no hover: a tap on a card lifts its corner for a moment
function onDown(e: PointerEvent) {
  if (e.pointerType !== 'touch') return;
  for (const entry of cards) {
    if (!(e.target instanceof Node) || !entry.el.contains(e.target)) continue;
    entry.target = entry.lift.by;
    window.clearTimeout(entry.hold);
    entry.hold = window.setTimeout(() => {
      entry.hold = 0;
      entry.target = 0;
      kick();
    }, TAP_HOLD);
  }
  kick();
}

function listen(on: boolean) {
  if (on) {
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true, capture: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
  } else {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown, { capture: true });
    document.documentElement.removeEventListener('pointerleave', onLeave);
  }
}

/**
 * Lifts a card's cut corner toward the pointer: the cut (card-corner) grows
 * by up to `by` px as the pointer nears the card's top-right corner, and
 * settles back when it leaves. A tap lifts it for a moment on touch. The
 * pointer is followed on the whole page, not on the card, because the cut
 * corner is clipped away: the card alone would lose the pointer just as it
 * reached the corner. Sets --r9-card-lift on the element; card-corner and
 * card-ornament read it.
 *
 * Off unless the library's ThemeConfig has `lift` (or `lift` is passed);
 * NineOS and Plain have none. With reduced motion the corner snaps instead
 * of following.
 */
export function useCardLift(ref: RefObject<HTMLElement | null>, lift?: CardLift): void {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const config = lift ?? theme.lift;
  const by = config?.by ?? 0;
  const reach = config?.reach ?? 0;
  const follow = config?.follow ?? 0;

  useEffect(() => {
    const el = ref.current;
    if (!el || by <= 0 || reach <= 0) return;
    const entry: Entry = { el, lift: { by, reach, follow }, reduced, cur: 0, target: 0, hold: 0 };
    if (!cards.size) listen(true);
    cards.add(entry);
    return () => {
      window.clearTimeout(entry.hold);
      cards.delete(entry);
      if (!cards.size) listen(false);
      el.style.removeProperty('--r9-card-lift');
    };
  }, [ref, by, reach, follow, reduced]);
}
