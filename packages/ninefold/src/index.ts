// @rnine/ninefold: Ninefold components. Every @rnine/core export (the same
// names and props in every library), in the Ninefold look, plus Ninefold's
// own pieces. Motion effects are in "@rnine/ninefold/motion".
// Styles: import "@rnine/ninefold/fonts.css" and "@rnine/ninefold/styles.css" once.

export * from '@rnine/core';

// Role exports: Ninefold's own versions of them
export { MOOD_BOOT_SCRIPT, NINEFOLD_THEME, ThemeProvider, moodBootScript } from './provider/ThemeProvider';
export { Mark } from './motion/Mark';

// Core pieces in Ninefold's look: the folded card, the wax-stamp button
export { Card } from './components/Card/Card';
export { Button } from './components/Button/Button';

// Ninefold only
export { PenLink } from './components/PenLink/PenLink';
export type { PenLinkProps } from './components/PenLink/PenLink';
export { LanternTrail } from './components/LanternTrail/LanternTrail';
export type { LanternTrailProps, TrailStop } from './components/LanternTrail/LanternTrail';
export { FieldJournal } from './components/FieldJournal/FieldJournal';
export type { FieldJournalProps, JournalEntry } from './components/FieldJournal/FieldJournal';
export { MoonDial } from './components/MoonDial/MoonDial';
export type { MoonDialProps } from './components/MoonDial/MoonDial';
export { moonPhase } from './components/MoonDial/moon';
export type { MoonPhase } from './components/MoonDial/moon';
