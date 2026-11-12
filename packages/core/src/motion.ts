// @rnine/core/motion: the motion layer every library has, by role. A library
// brings its own TextReveal, Backdrop, Mark, PageEffects and swap (Plain's are
// still or simple fades). Every effect stops when the system asks for reduced
// motion (or ThemeProvider reducedMotion is on).

export { TextReveal } from './motion/TextReveal';
export type { TextRevealProps } from './motion/TextReveal';
export { useTextReveal } from './motion/useTextReveal';
export type { TextRevealControl } from './motion/useTextReveal';
export { Backdrop } from './motion/Backdrop';
export type { BackdropProps } from './motion/Backdrop';
export { Mark } from './motion/Mark';
export { PageEffects } from './motion/PageEffects';
export { swapIn, swapOut, SWAP_IN_MS, SWAP_OUT_MS } from './motion/swap';
export { Magnet } from './motion/Magnet';
export { TiltCard } from './motion/TiltCard';
export { Reveal } from './motion/Reveal';
export { LiveClock } from './motion/LiveClock';
export { rippleAt, RIPPLE_EVENT } from './motion/ripple';
export type { RippleDetail } from './motion/ripple';

export { ForceReducedMotion, useFinePointer, useReducedMotion, useSystemReducedMotion } from './hooks/motion';
