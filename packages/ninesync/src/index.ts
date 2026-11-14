// @rnine/ninesync: NineSync components. Every @rnine/core export (the same
// names and props in every library), in the NineSync look, plus NineSync's
// own pieces. Motion effects are in "@rnine/ninesync/motion".
// Styles: import "@rnine/ninesync/fonts.css" and "@rnine/ninesync/styles.css" once.
import './look.scss';

export * from '@rnine/core';

// Role exports: NineSync's own versions of them
export { MOOD_BOOT_SCRIPT, NINESYNC_THEME, ThemeProvider, moodBootScript } from './provider/ThemeProvider';

// Core pieces with NineSync's marks: tabs and the side nav glide, page titles draw theirs
export { Tabs } from './components/Tabs/Tabs';
export { SideNav } from './components/SideNav/SideNav';
export { PageHeader } from './components/PageHeader/PageHeader';

// NineSync only: the client's colors, the live dot
export { ClientTheme } from './client/ClientTheme';
export { DEFAULT_CLIENT_COLORS, SYNC_BASE, clientThemeCss, syncColors, syncMood, tintedGreys } from './client/syncColors';
export type { SyncMood, SyncRoles } from './client/syncColors';
export { LiveDot } from './components/LiveDot/LiveDot';
