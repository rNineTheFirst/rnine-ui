import type { ClientColors, MarkArtwork } from '@rnine/core';

/** The sample client's mark (Storybook, the brand kit): a disc with a hexagon cut out (the inner path winds the other way, so it's a hole without fill-rule; a placeholder; apps pass their client's own). */
export const SAMPLE_MARK: MarkArtwork = {
  full: '<svg viewBox="0 0 100 100"><path d="M50 4a46 46 0 1 1 0 92a46 46 0 1 1 0-92Z M50 28L31 39V61L50 72L69 61V39Z"/></svg>',
  simplified: '<svg viewBox="0 0 100 100"><path d="M50 2a48 48 0 1 1 0 96a48 48 0 1 1 0-96Z M50 34L36 42V58L50 66L64 58V42Z"/></svg>',
};

/** Client colors to try (Storybook's toolbar, the brand kit's builder): each passes, except the last, which shows the checks failing. */
export const SAMPLE_CLIENTS: { id: string; name: string; colors: ClientColors }[] = [
  { id: 'sync', name: 'Sync blue (the default)', colors: { brand: '#2B4D82', dark: '#A2C4F6' } },
  { id: 'orange', name: 'Orange, a darker second color for Light', colors: { brand: '#F07F13', light: '#A3560D' } },
  { id: 'green', name: 'Green, a lighter second color for Dark', colors: { brand: '#0B6E4F', dark: '#5FD3A8' } },
  { id: 'plum', name: 'Plum, a lighter second color for Dark', colors: { brand: '#6B3FA0', dark: '#B39AE0' } },
  { id: 'yellow', name: 'Yellow, no second color (fails in Light)', colors: { brand: '#FFD100' } },
];
