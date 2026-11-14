import { ThemeRoot, type ThemeConfig, type ThemeProviderProps } from '@rnine/core/kit';
import { moodBootScript as coreBootScript, type BootScriptOptions } from '@rnine/core';
import { TextReveal } from '../motion/TextReveal';
import { PageEffects } from '../motion/PageEffects';
import { swapIn } from '../motion/swap';

/** Ninefold: its moods (Glint and Gloam), Auto rule, effects and card lift. Matches theme.json (a test checks). */
export const NINEFOLD_THEME: ThemeConfig = {
  name: 'Ninefold',
  moods: {
    light: { id: 'glint', label: 'Glint', description: 'The day mood: honey paper, iron-gall ink, claret wax, falling leaves.' },
    dark: { id: 'gloam', label: 'Gloam', description: 'The night mood: a walnut desk by candlelight, rose ink, fireflies.' },
  },
  auto: 'night',
  slots: { TextReveal, PageEffects, swapIn },
  // A card's folded corner lifts from 26px to 60px as the pointer comes within 450px of it (tuned)
  lift: { by: 34, reach: 450, follow: 0.4 },
};

/**
 * Wrap the app once. It keeps the mood on <html data-scheme="light|dark">
 * (Glint and Gloam): the viewer's saved choice, or Glint by day and, at
 * night, Gloam for a dark system setting (flipping at dusk, dawn, and when
 * the system switches). See useMood. It also applies the viewer's saved
 * motion setting (MotionToggle), mounts the page effects (click bursts of
 * leaves or fireflies, dew by day) and gives every Mark the app's artwork.
 *
 *   <ThemeProvider mark={{ full: markSvg }} mood={{ cookieDomain: 'example.com' }}>
 *     <App />
 *   </ThemeProvider>
 */
export function ThemeProvider(props: ThemeProviderProps) {
  return <ThemeRoot config={NINEFOLD_THEME} {...props} />;
}

/**
 * The script to paste into each app's index.html <head> as an inline
 * <script>, so the first paint already has the right mood. Ninefold's Auto
 * rule (the night rule) is the default; pass the same storageKey as configureMood.
 */
export function moodBootScript(options: BootScriptOptions = {}): string {
  return coreBootScript({ auto: NINEFOLD_THEME.auto, names: NINEFOLD_THEME.moods, ...options });
}

/** moodBootScript() with the default storage key. */
export const MOOD_BOOT_SCRIPT = moodBootScript();
