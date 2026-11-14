import { ThemeRoot, type ThemeConfig, type ThemeProviderProps } from '@rnine/core/kit';
import { moodBootScript as coreBootScript, type BootScriptOptions } from '@rnine/core';
import { TextReveal } from '../motion/TextReveal';
import { PageEffects } from '../motion/PageEffects';

/** NineSync: its moods (Light and Dark), Auto rule and effects. Matches theme.json (a test checks). */
export const NINESYNC_THEME: ThemeConfig = {
  name: 'NineSync',
  moods: {
    light: { id: 'light', label: 'Light', description: "Greys tinted toward the client's color, white cards, the brand color for actions." },
    dark: { id: 'dark', label: 'Dark', description: "The same roles on near-black, with the client's lighter second color." },
  },
  auto: 'system',
  slots: { TextReveal, PageEffects },
};

/**
 * Wrap the app once. It keeps the mood on <html data-scheme="light|dark">:
 * the viewer's saved choice, or the system setting. See useMood. It also
 * applies the viewer's saved motion setting (MotionToggle), plays the screen
 * cascade (content marked data-cascade) and gives every Mark the app's
 * artwork. The client's colors come from ClientTheme.
 *
 *   <ThemeProvider mark={{ full: markSvg }}>
 *     <ClientTheme colors={{ brand: '#0B6E4F' }} />
 *     <App />
 *   </ThemeProvider>
 */
export function ThemeProvider(props: ThemeProviderProps) {
  return <ThemeRoot config={NINESYNC_THEME} {...props} />;
}

/**
 * The script to paste into each app's index.html <head> as an inline
 * <script>, so the first paint already has the right mood. NineSync's Auto
 * rule (follow the system) is the default; pass the same storageKey as configureMood.
 */
export function moodBootScript(options: BootScriptOptions = {}): string {
  return coreBootScript({ auto: NINESYNC_THEME.auto, names: NINESYNC_THEME.moods, ...options });
}

/** moodBootScript() with the default storage key. */
export const MOOD_BOOT_SCRIPT = moodBootScript();
