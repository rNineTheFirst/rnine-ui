// The mood's types, keys and boot script, without React: the hooks (mood.ts)
// build on it, and so do static pages (@rnine/core/pages), which run in
// Workers and Node.

/** The two color schemes every library has a mood for. */
export type Scheme = 'light' | 'dark';
/** 'auto' follows the library's Auto rule (see AutoRule). */
export type MoodSetting = Scheme | 'auto';
/**
 * What Auto does. system: follow the system's light/dark setting.
 * night: light by day (DAY_STARTS-NIGHT_STARTS, local time); at night, dark
 * only when the system is set to dark.
 */
export type AutoRule = 'system' | 'night';
/** A library's name for one of its moods (NineOS: Clear and Cipher). */
export type MoodName = { id: string; label: string; description?: string };
export type MoodNames = Record<Scheme, MoodName>;

/** The default key for the chosen mood: localStorage and the cookie name (see configureMood). */
export const MOOD_STORAGE_KEY = 'mood';
/** The default localStorage key for the motion setting (Motion or Still). */
export const MOTION_STORAGE_KEY = 'motion';
/** The night rule: light from this hour (local time)... */
export const DAY_STARTS = 6;
/** ...until this hour, then dark for a dark system. */
export const NIGHT_STARTS = 18;

export const PLAIN_NAMES: MoodNames = { light: { id: 'light', label: 'Light' }, dark: { id: 'dark', label: 'Dark' } };

/** A storage key as given, or an error: letters, digits, - and _ only (it goes into a cookie and a script). */
export function checkKey(key: string) {
  if (!/^[\w-]+$/.test(key)) throw new Error(`Storage key "${key}": use letters, digits, - and _`);
  return key;
}

export type BootScriptOptions = {
  /** The localStorage key and cookie name for the chosen mood. Default "mood". */
  storageKey?: string;
  /** The localStorage key for the motion setting. Default "motion". */
  motionStorageKey?: string;
  /** The Auto rule. Default: the library's. */
  auto?: AutoRule;
  /** Mood ids an older version may have saved, read as their scheme. Default: the library's. */
  names?: MoodNames;
};

/**
 * The boot script itself, from explicit options (Plain's defaults). Sets
 * <html data-scheme> from the shared cookie, else the saved choice, else the
 * Auto rule, and data-motion="reduced" for a saved Still setting.
 */
export function bootScript({ storageKey: key = MOOD_STORAGE_KEY, motionStorageKey: motionKey = MOTION_STORAGE_KEY, auto = 'system', names: ids = PLAIN_NAMES }: BootScriptOptions = {}): string {
  checkKey(key);
  checkKey(motionKey);
  const legacy = [ids.light.id !== 'light' ? `m==='${ids.light.id}'?'light':` : '', ids.dark.id !== 'dark' ? `m==='${ids.dark.id}'?'dark':` : ''].join('');
  const rule = auto === 'system' ? "d?'dark':'light'" : `h>=${DAY_STARTS}&&h<${NIGHT_STARTS}||!d?'light':'dark'`;
  return (
    `try{var r=document.documentElement,m=(document.cookie.match(/(^|; )${key}=([a-z-]+)/)||[])[2],h=new Date().getHours(),` +
    "d=!!(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);" +
    `try{m=m||localStorage.getItem('${key}')}catch(e){}` +
    (legacy ? `m=${legacy}m;` : '') +
    `r.setAttribute('data-scheme',m==='light'||m==='dark'?m:(${rule}));` +
    `if(localStorage.getItem('${motionKey}')==='reduced')r.setAttribute('data-motion','reduced')}catch(e){}`
  );
}
