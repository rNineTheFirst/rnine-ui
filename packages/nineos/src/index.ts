// @rnine/nineos: NineOS components. Every @rnine/core export (the same names
// and props in every library), in the NineOS look, plus NineOS's own shell
// pieces. Motion effects are in "@rnine/nineos/motion".
// Styles: import "@rnine/nineos/fonts.css" and "@rnine/nineos/styles.css" once.

export * from '@rnine/core';

// Role exports: NineOS's own versions of them
export { MOOD_BOOT_SCRIPT, NINEOS_THEME, ThemeProvider, moodBootScript } from './provider/ThemeProvider';
export { Mark } from './motion/Monogram';

// NineOS only: the CLI-plus-panels shell (see the brand kit's Patterns chapter)
export { PanelStage } from './components/Panel/PanelStage';
export { CommandLine } from './components/CommandLine/CommandLine';
export type { CommandSpec } from './components/CommandLine/CommandLine';
export { ChipBar } from './components/CommandLine/ChipBar';
export type { ChipItem } from './components/CommandLine/ChipBar';
export { Dock, Hud, Kbd } from './components/Chrome/Chrome';
export { Hint } from './components/Hint/Hint';
