// What core's sites know at build time (themes.mjs), passed in as __SITE__.

/** A mood's main colors, resolved to #RRGGBB. */
export type MoodColors = Partial<Record<'bg' | 'surface' | 'fg' | 'fg-muted' | 'line' | 'accent' | 'accent-text' | 'on-accent' | 'signal' | 'wax' | 'wax-light' | 'wax-dark', string>>;

/** A theme built on core: a package next to core with a theme.json. */
export type ThemeInfo = {
  /** Its package folder, also its path on the sites (/<id>/). */
  id: string;
  name: string;
  package: string;
  version: string;
  tagline: string;
  moods: Record<'light' | 'dark', { label: string; description: string }>;
  colors: Record<'light' | 'dark', MoodColors>;
  /** The theme's monogram (SVG with filled paths), or null until it has one. */
  monogram: string | null;
  /** Its heavy-stroke version for small sizes, if it has one. */
  monogramSimplified: string | null;
  /** The theme's own card picture in each mood (e.g. its monogram pressed into its seal), if it draws one. */
  emblem: Record<'light' | 'dark', string> | null;
};

export type SiteInfo = {
  themes: ThemeInfo[];
  /** The host's mark for core's own sites, else the placeholder. */
  mark: { full: string; simplified?: string } | null;
  icons: string;
  appleTouchIcon: boolean;
  /** Where the brand kits are hosted, ending in "/" (core's at the root, each theme's at <id>/). */
  brandUrl: string | null;
  /** Where the Storybooks are hosted, ending in "/". */
  docsUrl: string | null;
  /** The theme that used to be at the root; old links to it are sent to /<id>/. */
  formerRoot: string | null;
};
