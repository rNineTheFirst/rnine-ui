import { ThemeRoot, type ThemeConfig, type ThemeProviderProps } from '@rnine/core/kit';
import { moodBootScript as coreBootScript, type BootScriptOptions } from '@rnine/core';
import { TextReveal } from '../motion/DecryptText';
import { PageEffects } from '../motion/PageEffects';

/** NineOS: its moods (Clear and Cipher), Auto rule and effects. Matches theme.json (a test checks). */
export const NINEOS_THEME: ThemeConfig = {
  name: 'NineOS',
  moods: {
    light: { id: 'clear', label: 'Clear', description: 'The light mood: white, ink, magenta.' },
    dark: { id: 'cipher', label: 'Cipher', description: 'The dark mood: near-black, neon magenta, scanlines.' },
  },
  auto: 'night',
  slots: { TextReveal, PageEffects },
};

/**
 * Wrap the app once. It keeps the mood on <html data-scheme="light|dark">
 * (Clear and Cipher): the viewer's saved choice, or Clear by day and, at
 * night, Cipher for a dark system setting (flipping at dusk, dawn, and when
 * the system switches). See useMood. It also applies the viewer's saved
 * motion setting (MotionToggle), mounts the page effects (Cipher scanlines,
 * magenta click sparks) and gives every Mark the app's artwork.
 *
 *   <ThemeProvider mark={{ full: markSvg }} mood={{ cookieDomain: 'example.com' }}>
 *     <App />
 *   </ThemeProvider>
 */
export function ThemeProvider(props: ThemeProviderProps) {
  return <ThemeRoot config={NINEOS_THEME} {...props} />;
}

/**
 * The script to paste into each app's index.html <head> as an inline
 * <script>, so the first paint already has the right mood. NineOS's Auto rule
 * (the night rule) is the default; pass the same storageKey as configureMood.
 */
export function moodBootScript(options: BootScriptOptions = {}): string {
  return coreBootScript({ auto: NINEOS_THEME.auto, names: NINEOS_THEME.moods, ...options });
}

/** moodBootScript() with the default storage key. (Apps' tests check their copy matches.) */
export const MOOD_BOOT_SCRIPT = moodBootScript();
