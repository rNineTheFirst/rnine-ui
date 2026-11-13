/**
 * Core's kit chapters, in page order: [anchor id, label]. The ids differ from
 * the theme kits' ones, so an old link to a theme's chapter is never taken for
 * one of these (main.tsx sends it on).
 */
export const CHAPTERS = [
  ['themes', 'Themes'],
  ['core', 'Core'],
  ['roles', 'Color'],
  ['moods', 'Moods'],
  ['mixins', 'Shape'],
  ['effects', 'Effects'],
  ['catalog', 'Components'],
  ['build', 'Build a theme'],
  ['downloads', 'Downloads'],
  ['contrast', 'Accessibility'],
] as const;
