import type { ComponentProps } from 'react';
import { Magnet as CoreMagnet } from '@rnine/core/motion';

/**
 * Leans its child toward the pointer when the pointer gets close: core's
 * Magnet with Ninefold's gentler pull (it moves at most 7px).
 */
export function Magnet({ strength = 0.22, max = 7, ...rest }: ComponentProps<typeof CoreMagnet>) {
  return <CoreMagnet strength={strength} max={max} {...rest} />;
}
