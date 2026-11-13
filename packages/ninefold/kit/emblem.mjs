// Ninefold's picture on the theme cards (core/site/themes.mjs reads it from
// theme.json "emblem"): its monogram pressed into its wax seal, in a mood's colors.
import { sealSvg } from '../src/motion/seal.ts';

export function emblem({ monogram, colors }) {
  return sealSvg({ wax: colors.wax, waxLight: colors['wax-light'], waxDark: colors['wax-dark'] }, monogram, { size: 112 });
}
