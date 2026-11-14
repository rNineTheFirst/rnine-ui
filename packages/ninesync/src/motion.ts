// @rnine/ninesync/motion: the NineSync motion layer, subtle but alive. Every
// @rnine/core/motion export, with NineSync's own effects in the roles:
// TextReveal rises in and draws its pale mark, the content swap lifts new
// content 6px into place, PageEffects plays the screen cascade, and the
// Backdrop is the still page (only LiveDot moves on its own). Mark is
// core's, still. Every effect stops when the system asks for reduced motion
// (or ThemeProvider reducedMotion is on).

export * from '@rnine/core/motion';

export { TextReveal } from './motion/TextReveal';
export { Backdrop } from './motion/Backdrop';
export { PageEffects } from './motion/PageEffects';
export { swapIn, swapOut, SWAP_IN_MS, SWAP_OUT_MS } from './motion/swap';

// NineSync only
export { Glide } from './motion/Glide';
export { Cascade } from './motion/Cascade';
export { cascade, watchCascades, CASCADE_ROW_MS, CASCADE_STEP_MS } from './motion/screenCascade';
export { CountUp } from './motion/CountUp';
export { pop, wash, WASH_MS } from './motion/wash';
