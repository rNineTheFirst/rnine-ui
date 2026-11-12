import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MoodToggle, MotionToggle } from '../components/Brand/Brand';
import { PLAIN_THEME, ThemeProvider, ThemeRoot, type ThemeConfig } from '../provider/ThemeProvider';
import { useReducedMotion } from './motion';
import { MOTION_STORAGE_KEY, setStill } from './motionSetting';
import { MOOD_BOOT_SCRIPT, MOOD_STORAGE_KEY, configureMood, moodBootScript, schemeAt, setMood, setMoodDefaults, useMood, watchMood } from './mood';

const scheme = () => document.documentElement.getAttribute('data-scheme');
const at = (h: number, m = 0) => new Date(2026, 10, 8, h, m);

// A library with its own mood names and the night rule (like NineOS)
const NAMED: ThemeConfig = {
  ...PLAIN_THEME,
  name: 'Named',
  moods: { light: { id: 'clear', label: 'Clear' }, dark: { id: 'cipher', label: 'Cipher' } },
  auto: 'night',
};
const useNamed = () => setMoodDefaults({ names: NAMED.moods, auto: NAMED.auto });

// Node's own (unconfigured) localStorage shadows jsdom's, so give the tests a real one
const store = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => [...store.keys()][i] ?? null,
  get length() { return store.size; },
});

// The system's light/dark setting, switchable mid-test (listeners hear the switch)
let osDark = false;
const darkListeners = new Set<() => void>();
const realMatchMedia = window.matchMedia;
function setOsDark(dark: boolean) {
  osDark = dark;
  darkListeners.forEach((l) => l());
}

const clearCookie = () => { document.cookie = `${MOOD_STORAGE_KEY}=; Path=/; Max-Age=0`; };

beforeEach(() => {
  localStorage.clear();
  clearCookie();
  setMoodDefaults({ names: PLAIN_THEME.moods, auto: PLAIN_THEME.auto });
  document.documentElement.removeAttribute('data-scheme');
  document.documentElement.removeAttribute('data-motion');
  osDark = false;
  darkListeners.clear();
  window.matchMedia = ((query: string) => ({
    get matches() { return query.includes('prefers-color-scheme: dark') ? osDark : false; },
    media: query,
    onchange: null,
    addEventListener: (_: string, l: () => void) => { if (query.includes('prefers-color-scheme')) darkListeners.add(l); },
    removeEventListener: (_: string, l: () => void) => darkListeners.delete(l),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  window.matchMedia = realMatchMedia;
  vi.useRealTimers();
});

describe('schemeAt', () => {
  it('follows the system with the system rule (Plain), whatever the time', () => {
    expect(schemeAt(at(12), true, 'system')).toBe('dark');
    expect(schemeAt(at(0), false, 'system')).toBe('light');
  });

  it('with the night rule: light by day; at night, dark only for a dark system', () => {
    expect(schemeAt(at(5, 59), true, 'night')).toBe('dark');
    expect(schemeAt(at(6), true, 'night')).toBe('light');
    expect(schemeAt(at(12), true, 'night')).toBe('light');
    expect(schemeAt(at(17, 59), true, 'night')).toBe('light');
    expect(schemeAt(at(18), true, 'night')).toBe('dark');
    expect(schemeAt(at(0), true, 'night')).toBe('dark');
    // A light system stays light all night
    expect(schemeAt(at(18), false, 'night')).toBe('light');
    expect(schemeAt(at(0), false, 'night')).toBe('light');
  });

  it("uses the library's rule, unless the app overrides it", () => {
    expect(schemeAt(at(12), true)).toBe('dark');
    useNamed();
    expect(schemeAt(at(12), true)).toBe('light');
    configureMood({ auto: 'system' });
    expect(schemeAt(at(12), true)).toBe('dark');
    configureMood();
  });
});

describe('the boot script', () => {
  const boot = (script = MOOD_BOOT_SCRIPT) => new Function(script)();

  it('follows the system by default (Plain)', () => {
    vi.useFakeTimers({ now: at(9) });
    setOsDark(true);
    boot();
    expect(scheme()).toBe('dark');
    setOsDark(false);
    boot();
    expect(scheme()).toBe('light');
  });

  it('with the night rule, picks light by day and dark at night only for a dark system', () => {
    const night = moodBootScript({ auto: 'night' });
    vi.useFakeTimers({ now: at(9) });
    setOsDark(true);
    boot(night);
    expect(scheme()).toBe('light');
    vi.setSystemTime(at(21));
    boot(night);
    expect(scheme()).toBe('dark');
    setOsDark(false);
    boot(night);
    expect(scheme()).toBe('light');
  });

  it('applies the saved Still before first paint', () => {
    localStorage.setItem(MOTION_STORAGE_KEY, 'reduced');
    boot();
    expect(document.documentElement).toHaveAttribute('data-motion', 'reduced');
  });

  it('uses the saved choice whatever the system', () => {
    setOsDark(true);
    localStorage.setItem(MOOD_STORAGE_KEY, 'light');
    boot();
    expect(scheme()).toBe('light');
  });

  it("reads a library's mood id (saved by an older version) as its scheme", () => {
    vi.useFakeTimers({ now: at(9) });
    localStorage.setItem(MOOD_STORAGE_KEY, 'cipher');
    boot(moodBootScript({ names: NAMED.moods, auto: 'night' }));
    expect(scheme()).toBe('dark');
  });
});

describe('the shared mood cookie', () => {
  const boot = () => new Function(MOOD_BOOT_SCRIPT)();

  it('is written with every choice, Auto included', () => {
    setMood('dark');
    expect(document.cookie).toContain('mood=dark');
    setMood('auto');
    expect(document.cookie).toContain('mood=auto');
    clearCookie();
  });

  it("wins over this site's saved choice, before first paint and after", () => {
    localStorage.setItem(MOOD_STORAGE_KEY, 'light');
    document.cookie = 'mood=dark; Path=/';
    boot();
    expect(scheme()).toBe('dark');
    const stop = watchMood();
    expect(scheme()).toBe('dark');
    stop();
  });

  it('carries Auto across: a stale saved choice no longer applies', () => {
    localStorage.setItem(MOOD_STORAGE_KEY, 'dark');
    document.cookie = 'mood=auto; Path=/';
    boot();
    expect(scheme()).toBe('light');
    const stop = watchMood();
    expect(scheme()).toBe('light');
    stop();
  });

  it("ignores anything that isn't a mood, and reads the library's mood ids", () => {
    localStorage.setItem(MOOD_STORAGE_KEY, 'dark');
    document.cookie = 'mood=neon; Path=/';
    let stop = watchMood();
    expect(scheme()).toBe('dark');
    stop();
    useNamed();
    document.cookie = 'mood=clear; Path=/';
    stop = watchMood();
    expect(scheme()).toBe('light');
    stop();
  });
});

describe('the mood toggle', () => {
  it('follows Auto until clicked, then remembers the choice', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<MoodToggle />);
    let stop = () => {};
    act(() => { stop = watchMood(); });
    expect(scheme()).toBe('light');
    expect(screen.getByRole('button', { name: 'Auto' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Dark' }));
    expect(scheme()).toBe('dark');
    expect(localStorage.getItem(MOOD_STORAGE_KEY)).toBe('dark');

    // Auto forgets the choice and follows the rule again
    await user.click(screen.getByRole('button', { name: 'Auto' }));
    expect(localStorage.getItem(MOOD_STORAGE_KEY)).toBeNull();
    expect(scheme()).toBe('light');
    stop();
    unmount();
  });

  it("is labeled with the library's mood names", () => {
    render(<ThemeRoot config={NAMED} effects={false}><MoodToggle /></ThemeRoot>);
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cipher' })).toBeInTheDocument();
  });

  it('follows the system switching to dark, live', () => {
    const stop = watchMood();
    expect(scheme()).toBe('light');
    act(() => setOsDark(true));
    expect(scheme()).toBe('dark');
    stop();
  });

  it('flips Auto at dusk without a reload (night rule, dark system)', () => {
    useNamed();
    setOsDark(true);
    vi.useFakeTimers({ now: at(17, 59) });
    const stop = watchMood();
    expect(scheme()).toBe('light');
    act(() => {
      vi.setSystemTime(at(18, 0));
      vi.advanceTimersByTime(60_000);
    });
    expect(scheme()).toBe('dark');
    stop();
  });

  it('leaves a chosen mood alone at dusk', () => {
    useNamed();
    vi.useFakeTimers({ now: at(17, 59) });
    setMood('light');
    const stop = watchMood();
    act(() => {
      vi.setSystemTime(at(18, 30));
      vi.advanceTimersByTime(60_000);
    });
    expect(scheme()).toBe('light');
    stop();
    setMood('auto');
  });
});

describe('mood settings', () => {
  // Captures what's written to document.cookie (attributes like Domain aren't readable back)
  function cookieWrites() {
    const writes: string[] = [];
    const proto = Object.getPrototypeOf(document);
    const real = Object.getOwnPropertyDescriptor(proto, 'cookie')!;
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => real.get!.call(document),
      set: (v: string) => { writes.push(v); real.set!.call(document, v); },
    });
    return { writes, restore: () => { delete (document as { cookie?: string }).cookie; } };
  }

  afterEach(() => {
    configureMood();
    document.cookie = 'example-mood=; Path=/; Max-Age=0';
  });

  it('keeps the cookie on this host unless a cookie domain is set', () => {
    const spy = cookieWrites();
    setMood('dark');
    expect(spy.writes.at(-1)).not.toContain('Domain=');
    // jsdom runs on localhost: share it there
    configureMood({ cookieDomain: 'localhost' });
    setMood('light');
    expect(spy.writes.at(-1)).toContain('; Domain=localhost');
    // On any other host it stays on the host
    configureMood({ cookieDomain: 'example.com' });
    setMood('auto');
    expect(spy.writes.at(-1)).not.toContain('Domain=');
    spy.restore();
  });

  it('uses its own storage key and cookie name, the boot script too', () => {
    configureMood({ storageKey: 'example-mood' });
    setMood('dark');
    expect(localStorage.getItem('example-mood')).toBe('dark');
    expect(localStorage.getItem(MOOD_STORAGE_KEY)).toBeNull();
    expect(document.cookie).toContain('example-mood=dark');
    document.documentElement.removeAttribute('data-scheme');
    new Function(moodBootScript({ storageKey: 'example-mood' }))();
    expect(scheme()).toBe('dark');
    expect(moodBootScript()).toBe(MOOD_BOOT_SCRIPT);
  });

  it('keeps the motion setting under its own key, the boot script too', () => {
    configureMood({ motionStorageKey: 'example-motion' });
    setStill(true);
    expect(localStorage.getItem('example-motion')).toBe('reduced');
    expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBeNull();
    document.documentElement.removeAttribute('data-motion');
    new Function(moodBootScript({ motionStorageKey: 'example-motion' }))();
    expect(document.documentElement).toHaveAttribute('data-motion', 'reduced');
    setStill(false);
    expect(localStorage.getItem('example-motion')).toBeNull();
  });

  it('rejects a key that would break the cookie or the boot script', () => {
    expect(() => configureMood({ storageKey: "x'; alert(1)" })).toThrow();
    expect(() => moodBootScript({ storageKey: 'a b' })).toThrow();
    expect(() => moodBootScript({ motionStorageKey: "x')" })).toThrow();
  });

  it('ThemeProvider mood applies before its children read the mood', () => {
    localStorage.setItem('example-mood', 'dark');
    function Probe() {
      const { setting, mood } = useMood();
      return <span>{`${setting} ${mood.label}`}</span>;
    }
    render(<ThemeProvider effects={false} mood={{ storageKey: 'example-mood' }}><Probe /></ThemeProvider>);
    expect(screen.getByText('dark Dark')).toBeInTheDocument();
    expect(scheme()).toBe('dark');
  });
});

describe('the motion toggle', () => {
  function Probe() {
    return <span>{useReducedMotion() ? 'still' : 'moving'}</span>;
  }

  it('turns motion off for the page and every effect, and remembers it', async () => {
    const user = userEvent.setup();
    render(<ThemeProvider effects={false}><MotionToggle /><Probe /></ThemeProvider>);
    expect(screen.getByText('moving')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Still' }));
    expect(screen.getByText('still')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-motion', 'reduced');
    expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe('reduced');
    await user.click(screen.getByRole('button', { name: 'Motion' }));
    expect(screen.getByText('moving')).toBeInTheDocument();
    expect(document.documentElement).not.toHaveAttribute('data-motion');
  });
});
