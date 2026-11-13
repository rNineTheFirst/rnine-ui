import { useCallback, useSyncExternalStore } from 'react';
import { MOTION_STORAGE_KEY, configureMotion } from './motionSetting';

import { DAY_STARTS, MOOD_STORAGE_KEY, NIGHT_STARTS, PLAIN_NAMES, bootScript, checkKey } from './moodBoot';
import type { AutoRule, BootScriptOptions, MoodNames, MoodSetting, Scheme } from './moodBoot';

export { DAY_STARTS, MOOD_STORAGE_KEY, NIGHT_STARTS } from './moodBoot';
export type { AutoRule, BootScriptOptions, MoodName, MoodNames, MoodSetting, Scheme } from './moodBoot';

const DARK = '(prefers-color-scheme: dark)';

/** Whether the viewer's system is set to dark. */
export function systemDark(): boolean {
  try {
    return window.matchMedia(DARK).matches;
  } catch {
    return false;
  }
}

// The library's defaults (ThemeProvider sets them), then the app's options
let names: MoodNames = PLAIN_NAMES;
let libraryAuto: AutoRule = 'system';
let appAuto: AutoRule | undefined;
const autoRule = () => appAuto ?? libraryAuto;

/**
 * The scheme Auto picks for a moment. With the system rule, the system
 * setting. With the night rule, light by day (06:00-18:00, the viewer's local
 * time) and, at night, dark only when the system is set to dark: a light-mode
 * viewer is never surprised by the dark mood.
 */
export function schemeAt(date: Date = new Date(), dark: boolean = systemDark(), auto: AutoRule = autoRule()): Scheme {
  if (auto === 'system') return dark ? 'dark' : 'light';
  const hour = date.getHours();
  const day = hour >= DAY_STARTS && hour < NIGHT_STARTS;
  return !day && dark ? 'dark' : 'light';
}

export type MoodOptions = {
  /**
   * Share the chosen mood between a site's hosts: the cookie is set on this
   * domain and every subdomain (e.g. "example.com" covers app.example.com and
   * auth.example.com, which can't read each other's localStorage). Only used
   * on that domain; anywhere else (localhost, previews) the cookie stays on
   * the current host. Default: none, the cookie stays on the current host.
   */
  cookieDomain?: string;
  /** The localStorage key and cookie name for the chosen mood. Letters, digits, - and _. Default "mood". */
  storageKey?: string;
  /** The localStorage key for the motion setting (Motion or Still). Letters, digits, - and _. Default "motion". */
  motionStorageKey?: string;
  /** Override the library's Auto rule (NineOS: night; Plain: system). */
  auto?: AutoRule;
};

let cookieDomain: string | undefined;
let storageKey = MOOD_STORAGE_KEY;
let cookie = cookieMatcher(storageKey);

function cookieMatcher(key: string) {
  return new RegExp(`(^|; )${checkKey(key)}=([a-z-]+)`);
}

/** A stored value as a setting: a scheme, auto, or one of the library's mood ids (kept by older versions). */
function asSetting(value: string | null | undefined): MoodSetting | null {
  if (value === 'light' || value === 'dark' || value === 'auto') return value;
  if (value === names.light.id) return 'light';
  if (value === names.dark.id) return 'dark';
  return null;
}

function refresh() {
  if (listeners.size) {
    lastActive = readActive();
    notify();
  }
}

/**
 * Sets where the chosen mood is kept (and, optionally, the Auto rule). Call
 * it once before the first render (ThemeProvider's mood prop does).
 * Unchanged options do nothing.
 */
export function configureMood({ cookieDomain: domain, storageKey: key = MOOD_STORAGE_KEY, motionStorageKey = MOTION_STORAGE_KEY, auto }: MoodOptions = {}) {
  configureMotion(checkKey(motionStorageKey));
  const next = domain?.replace(/^\./, '') || undefined;
  if (next === cookieDomain && key === storageKey && auto === appAuto) return;
  cookie = cookieMatcher(key);
  cookieDomain = next;
  storageKey = key;
  appAuto = auto;
  refresh();
}

/** For libraries (ThemeProvider): their mood names and Auto rule. */
export function setMoodDefaults(defaults: { names: MoodNames; auto: AutoRule }) {
  if (defaults.names === names && defaults.auto === libraryAuto) return;
  names = defaults.names;
  libraryAuto = defaults.auto;
  refresh();
}

/** The library's mood names, by scheme. */
export function moodNames(): MoodNames {
  return names;
}

/**
 * The script to paste into each app's index.html <head> as an inline <script>,
 * so the first paint already has the right mood (the shared cookie, else the
 * saved choice, else the Auto rule) and the saved motion setting. Pass the
 * same storageKey, motionStorageKey and auto as configureMood. Each library exports its own,
 * with its Auto rule as the default.
 */
export function moodBootScript(options: BootScriptOptions = {}): string {
  return bootScript({ ...options, auto: options.auto ?? libraryAuto, names: options.names ?? names });
}

const listeners = new Set<() => void>();
// Used when storage is blocked, so a choice still lasts for this visit
let unsaved: Scheme | null = null;

/** The mood shared across the site's hosts (the cookie), if one was set. */
function readShared(): MoodSetting | null {
  try {
    return asSetting(document.cookie.match(cookie)?.[2]);
  } catch {
    return null;
  }
}

function writeShared(next: MoodSetting) {
  try {
    const host = window.location.hostname;
    const shared = cookieDomain && (host === cookieDomain || host.endsWith(`.${cookieDomain}`));
    const domain = shared ? `; Domain=${cookieDomain}` : '';
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${storageKey}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${domain}${secure}`;
  } catch {
    // Cookies can be blocked; localStorage still remembers it on this site
  }
}

function readSetting(): MoodSetting {
  const shared = readShared();
  if (shared) return shared;
  try {
    const saved = asSetting(localStorage.getItem(storageKey));
    return saved === 'light' || saved === 'dark' ? saved : 'auto';
  } catch {
    return unsaved ?? 'auto';
  }
}

function readActive(): Scheme {
  const setting = readSetting();
  return setting === 'auto' ? schemeAt() : setting;
}

/** Puts the current scheme on <html data-scheme>. Safe to call any time. */
export function applyMood() {
  document.documentElement.setAttribute('data-scheme', readActive());
}

function notify() {
  applyMood();
  listeners.forEach((l) => l());
}

// While anything listens: re-check each minute (dusk and dawn flip the night
// rule), when the system switches light/dark, when the tab comes back (a
// choice made on another host sharing the cookie), and follow choices made in
// other tabs.
let clock: ReturnType<typeof setInterval> | null = null;
let lastActive: Scheme | null = null;

function tick() {
  const active = readActive();
  if (active !== lastActive) {
    lastActive = active;
    notify();
  }
}

function onStorage(e: StorageEvent) {
  if (e.key === storageKey || e.key === null) notify();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (listeners.size === 1) {
    lastActive = readActive();
    clock = setInterval(tick, 60_000);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', tick);
    try {
      window.matchMedia(DARK).addEventListener('change', tick);
    } catch {
      // No matchMedia: the clock alone
    }
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) {
      if (clock) clearInterval(clock);
      clock = null;
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', tick);
      try {
        window.matchMedia(DARK).removeEventListener('change', tick);
      } catch {
        // Nothing was added
      }
    }
  };
}

/**
 * Keeps <html data-scheme> on the right scheme while mounted (ThemeProvider
 * calls it, so Auto follows the system and the clock even with no toggle on
 * screen). Returns the cleanup.
 */
export function watchMood(): () => void {
  applyMood();
  return subscribe(() => {});
}

/**
 * Sets and remembers the mood, on this site and on every host that shares
 * the cookie (configureMood cookieDomain). 'auto' forgets the choice and
 * follows the Auto rule again.
 */
export function setMood(next: MoodSetting) {
  writeShared(next);
  try {
    if (next === 'auto') localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, next);
  } catch {
    // Storage can be blocked; the mood still applies for this visit
  }
  unsaved = next === 'auto' ? null : next;
  lastActive = readActive();
  notify();
}

/**
 * The chosen setting, the scheme showing, the library's mood for it (its id
 * and label: NineOS's dark mood is Cipher), every mood's name, and a setter
 * that remembers the choice.
 */
export function useMood() {
  const setting = useSyncExternalStore(subscribe, readSetting, () => 'auto' as MoodSetting);
  const scheme = useSyncExternalStore(subscribe, readActive, () => 'light' as Scheme);
  const set = useCallback((next: MoodSetting) => setMood(next), []);
  return { setting, scheme, mood: names[scheme], moods: names, setMood: set };
}

/** moodBootScript() with the defaults (Plain's Auto rule, the default key). Libraries export their own. */
export const MOOD_BOOT_SCRIPT = moodBootScript();
