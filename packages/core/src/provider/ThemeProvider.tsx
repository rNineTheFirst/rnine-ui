import { createContext, useContext, useEffect, type ComponentType, type ReactNode } from 'react';
import { configureMood, setMoodDefaults, watchMood, type AutoRule, type MoodNames, type MoodOptions } from '../hooks/mood';
import { ForceReducedMotion, RevealOnce } from '../hooks/motion';
import { applyMotion } from '../hooks/motionSetting';
import { PageEffects } from '../motion/PageEffects';
import { TextReveal, type TextRevealProps } from '../motion/TextReveal';
import { MarkProvider, type MarkArtwork } from './mark';
import type { CardLift } from '../hooks/cardLift';

/** The effects core components draw with: each library brings its own. */
export type ThemeSlots = {
  /** Titles in Section, Panel and MenuRail. */
  TextReveal: ComponentType<TextRevealProps>;
  /** Page-wide effects ThemeProvider mounts (effects prop). */
  PageEffects: ComponentType;
  /** The swap's entrance on smaller things that change in place (a calendar's month). Default: Plain's fade. */
  swapIn?: (el: HTMLElement) => void;
};

/** What a library is: its name, mood names, Auto rule and effects. */
export type ThemeConfig = {
  /** The library's name, e.g. for the Wordmark default. */
  name: string;
  moods: MoodNames;
  auto: AutoRule;
  slots: ThemeSlots;
  /** Cards lift their cut corner toward the pointer (TiltCard, useCardLift). Default: off. */
  lift?: CardLift;
};

/** Plain, core's own look: the placeholder every library starts from. Matches theme.json (a test checks). */
export const PLAIN_THEME: ThemeConfig = {
  name: 'Plain',
  moods: {
    light: { id: 'light', label: 'Light', description: 'Neutral grays on white, one blue accent.' },
    dark: { id: 'dark', label: 'Dark', description: 'The same roles on near-black.' },
  },
  auto: 'system',
  slots: { TextReveal, PageEffects },
};

const ThemeContext = createContext<ThemeConfig>(PLAIN_THEME);

/**
 * Gives components a library's config (its effects, mood names) without
 * watching the mood: for previews like Storybook, where something else sets
 * the page's data-scheme. Apps use ThemeProvider.
 */
export function ThemeConfigProvider({ config, children }: { config: ThemeConfig; children: ReactNode }) {
  setMoodDefaults({ names: config.moods, auto: config.auto });
  return <ThemeContext.Provider value={config}>{children}</ThemeContext.Provider>;
}

/** The library in use (the nearest ThemeProvider's, else Plain). */
export function useTheme(): ThemeConfig {
  return useContext(ThemeContext);
}

export type ThemeProviderProps = {
  children: ReactNode;
  /** Turn motion off for this app, whatever the system setting (e.g. a "motion off" toggle). */
  reducedMotion?: boolean;
  /** The library's page-wide effects (NineOS: Cipher scanlines and click sparks). Default on. */
  effects?: boolean;
  /** Panel titles reveal only the first time each appears in a session (then they're simply there). Default off. */
  revealOnce?: boolean;
  /** The app's own mark, drawn by every Mark. Default: a placeholder frame. */
  mark?: MarkArtwork;
  /** Where the chosen mood is kept (storage key, a cookie domain to share it between hosts) and the Auto rule. See configureMood. */
  mood?: MoodOptions;
};

/**
 * For libraries: the provider with a library's config. A library exports
 * `ThemeProvider = (props) => <ThemeRoot config={ITS_THEME} {...props} />`.
 */
export function ThemeRoot({ config, children, reducedMotion = false, effects = true, revealOnce = false, mark, mood }: ThemeProviderProps & { config: ThemeConfig }) {
  // Before any child reads the mood (unchanged values do nothing)
  setMoodDefaults({ names: config.moods, auto: config.auto });
  if (mood) configureMood(mood);
  useEffect(() => watchMood(), []);
  useEffect(() => applyMotion(), []);
  const Effects = config.slots.PageEffects;
  const content = (
    <ThemeContext.Provider value={config}>
      <ForceReducedMotion.Provider value={reducedMotion}>
        <RevealOnce.Provider value={revealOnce}>
          {children}
          {effects && <Effects />}
        </RevealOnce.Provider>
      </ForceReducedMotion.Provider>
    </ThemeContext.Provider>
  );
  return mark ? <MarkProvider mark={mark}>{content}</MarkProvider> : content;
}

/**
 * Wrap the app once. It keeps the mood on <html data-scheme="light|dark">:
 * the viewer's saved choice, or the library's Auto rule (following the
 * system, and for the night rule the clock too). See useMood. It also applies
 * the viewer's saved motion setting (MotionToggle) and gives every Mark the
 * app's artwork.
 *
 *   <ThemeProvider mark={{ full: markSvg }} mood={{ cookieDomain: 'example.com' }}>
 *     <App />
 *   </ThemeProvider>
 */
export function ThemeProvider(props: ThemeProviderProps) {
  return <ThemeRoot config={PLAIN_THEME} {...props} />;
}
