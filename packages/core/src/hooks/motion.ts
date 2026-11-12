import { createContext, useContext, useSyncExternalStore } from 'react';
import { useMotionSetting } from './motionSetting';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** True when the system asks for reduced motion. */
export function useSystemReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}

/** The kit can also preview reduced motion without changing the system setting. */
export const ForceReducedMotion = createContext(false);

/** True when motion should be off: the system setting, the viewer's own Still, or the app forcing it. */
export function useReducedMotion(): boolean {
  const system = useSystemReducedMotion();
  const forced = useContext(ForceReducedMotion);
  const { still } = useMotionSetting();
  return system || forced || still;
}

/** Panels reveal their title only the first time it appears in a session (ThemeProvider revealOnce). */
export const RevealOnce = createContext(false);

/** True for mouse/trackpad users; magnet and tilt only make sense with a hovering pointer. */
export function useFinePointer(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(pointer: fine)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia('(pointer: fine)').matches,
    () => false,
  );
}
