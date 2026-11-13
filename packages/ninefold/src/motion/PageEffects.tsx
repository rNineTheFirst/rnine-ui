import { useEffect } from 'react';
import { useReducedMotion } from '@rnine/core/motion';
import { leafColor, spawn, type Particle } from '../fx/overlay';
import { isNight, readRoles } from '../fx/paint';

/** The tuned feel (round 3). */
const BURST = 5; // leaves in a click burst (fireflies: 1.3x)
const DEW_EVERY_MS = 1700; // a dew drop catches the light this often, by day

/** A click burst at a point (page coordinates): leaves by day, fireflies by night. */
function burst(x: number, y: number, el: Element) {
  const roles = readRoles(el);
  const list: Particle[] = [];
  if (roles.night) {
    for (let i = 0, n = Math.round(BURST * 1.3); i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1.4 + Math.random() * 2.4;
      list.push({ kind: 'fly', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: 1500 + Math.random() * 600, phase: Math.random() * 1000, size: 0.8 + Math.random() * 0.6, drag: 0.95, roles });
    }
  } else {
    for (let i = 0; i < BURST; i++) {
      // The first is a bud: a touch of the wax color
      list.push({ kind: 'leaf', x: x + (Math.random() - 0.5) * 10, y, vx: (Math.random() - 0.5) * 5, vy: -1.5 - Math.random() * 2.5, gravity: 0.055, drag: 0.985, rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.18, size: 0.8 + Math.random() * 0.6, color: i === 0 ? roles.bud : leafColor(roles, Math.random()), life: 0, max: 1700, roles });
    }
  }
  spawn(list);
}

/**
 * Ninefold's page-wide effects (ThemeProvider mounts them): a click or tap
 * scatters a few leaves by day, or a handful of fireflies by night; and by
 * day, now and then, a drop of dew catches the light somewhere on the page.
 * Nothing runs with reduced motion. Mount once.
 */
export function PageEffects() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      down = e.button === 0 || e.pointerType !== 'mouse' ? { x: e.clientX, y: e.clientY } : null;
    };
    // A click, not a drag (or writing with Ink)
    const onUp = (e: PointerEvent) => {
      if (!down || Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 6) return;
      down = null;
      const target = e.target instanceof Element ? e.target : document.documentElement;
      burst(e.clientX + window.scrollX, e.clientY + window.scrollY, target);
    };
    // Dew: a glint at a random spot on screen, by day, while the page is in view
    const dew = window.setInterval(() => {
      if (document.hidden || isNight(document.documentElement)) return;
      const roles = readRoles(document.documentElement);
      const x = window.scrollX + window.innerWidth * (0.06 + Math.random() * 0.88);
      const y = window.scrollY + window.innerHeight * (0.08 + Math.random() * 0.84);
      spawn([{ kind: 'twinkle', x, y, size: 3 + Math.random() * 3, life: 0, max: 900, color: roles.star, roles }]);
    }, DEW_EVERY_MS);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    return () => {
      window.clearInterval(dew);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [reduced]);

  return null;
}
