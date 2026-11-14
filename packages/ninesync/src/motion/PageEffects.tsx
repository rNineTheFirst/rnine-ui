import { useEffect } from 'react';
import { useReducedMotion } from '@rnine/core/motion';
import { watchCascades } from './screenCascade';

/**
 * NineSync's page-wide effect (ThemeProvider mounts it): the screen
 * cascade. Content marked data-cascade (or wrapped in Cascade) rises in,
 * block by block, when it appears. Nothing else moves on its own.
 */
export function PageEffects() {
  const reduced = useReducedMotion();
  useEffect(() => (reduced ? undefined : watchCascades()), [reduced]);
  return null;
}
