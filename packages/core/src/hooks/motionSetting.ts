import { useCallback, useSyncExternalStore } from 'react';

/**
 * The viewer's own motion setting ("Motion" or "Still"), for people who want
 * less movement but never set their system to reduce motion. Remembered in
 * their browser like the mood; Still puts data-motion="reduced" on <html>, which
 * stops CSS animation (base.css) and every effect that asks useReducedMotion().
 */
export const MOTION_STORAGE_KEY = 'motion';

let storageKey = MOTION_STORAGE_KEY;
const listeners = new Set<() => void>();
let unsaved: boolean | null = null;

function readStill(): boolean {
  try {
    return localStorage.getItem(storageKey) === 'reduced';
  } catch {
    return unsaved ?? false;
  }
}

/**
 * Sets the localStorage key for the motion setting (configureMood's
 * motionStorageKey, which ThemeProvider's mood prop passes). Unchanged keys do nothing.
 */
export function configureMotion(key: string = MOTION_STORAGE_KEY) {
  if (key === storageKey) return;
  storageKey = key;
  unsaved = null;
  applyMotion();
  listeners.forEach((l) => l());
}

/** Puts the saved setting on <html>. Safe to call any time. */
export function applyMotion() {
  if (readStill()) document.documentElement.setAttribute('data-motion', 'reduced');
  else document.documentElement.removeAttribute('data-motion');
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === storageKey || e.key === null) {
      applyMotion();
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

/** Turns motion off (still) or back on, and remembers it. */
export function setStill(still: boolean) {
  try {
    if (still) localStorage.setItem(storageKey, 'reduced');
    else localStorage.removeItem(storageKey);
  } catch {
    // Storage can be blocked; the setting still applies for this visit
  }
  unsaved = still;
  applyMotion();
  listeners.forEach((l) => l());
}

/** Whether the viewer chose Still, and a setter that remembers it. */
export function useMotionSetting() {
  const still = useSyncExternalStore(subscribe, readStill, () => false);
  const set = useCallback((next: boolean) => setStill(next), []);
  return { still, setStill: set };
}
