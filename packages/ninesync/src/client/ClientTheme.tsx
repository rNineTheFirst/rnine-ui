import { useMemo } from 'react';
import type { ClientColors } from '@rnine/core';
import { clientThemeCss, syncColors } from './syncColors';

type Props = {
  /** The client's brand color, and second colors for the moods where it fails. Check them first in the brand kit's builder. */
  colors: ClientColors;
  /** Where the colors apply: a selector for the element that carries data-scheme. Default :root. */
  scope?: string;
};

/**
 * Puts a client's colors on the app: the accent, the pale mark, the glow and
 * the greys tinted toward their hue, in both moods. Render it once, inside
 * ThemeProvider.
 *
 *   <ThemeProvider>
 *     <ClientTheme colors={{ brand: '#0B6E4F', dark: '#5FD3A8' }} />
 *     <App />
 *   </ThemeProvider>
 *
 * Colors are never changed to pass: where one fails (text under 4.5:1), a
 * suggested color stands in and a console warning says which second color
 * to ask the client for.
 */
export function ClientTheme({ colors, scope = ':root' }: Props) {
  const { brand, light, dark } = colors;
  const css = useMemo(() => {
    const own = { brand, light, dark };
    const result = syncColors(own);
    if (!result.ok) {
      const errors = [...result.light.checks, ...result.dark.checks].filter((c) => c.level === 'error').map((c) => c.message);
      console.warn(`NineSync ClientTheme: ${errors.join(' ')}`);
    }
    return clientThemeCss(own, scope);
  }, [brand, light, dark, scope]);
  return <style data-ninesync-client="">{css}</style>;
}
