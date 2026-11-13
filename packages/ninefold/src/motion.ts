// @rnine/ninefold/motion: the Ninefold motion layer. Every @rnine/core/motion
// export, with Ninefold's own effects in the roles: TextReveal grows letters
// by day and gathers fireflies into words at night, Backdrop is falling
// leaves by day and fireflies at night, Mark is a seal of poured wax, the
// panel swap is a swarm of fireflies or leaves, and PageEffects are click
// bursts and dew. Every effect stops when the system asks for reduced motion
// (or ThemeProvider reducedMotion is on).

export * from '@rnine/core/motion';

export { TextReveal } from './motion/TextReveal';
export { Backdrop } from './motion/Backdrop';
export { Mark } from './motion/Mark';
export { PageEffects } from './motion/PageEffects';
export { swapIn, swapOut, SWAP_IN_MS, SWAP_OUT_MS } from './motion/swap';

// Core effects in Ninefold's feel: the folded corner that lifts, a gentler magnet
export { TiltCard } from './components/Card/TiltCard';
export { Magnet } from './components/Magnet/Magnet';

// Ninefold only
export { HeroLight } from './components/HeroLight/HeroLight';
export type { HeroLightProps } from './components/HeroLight/HeroLight';
export { Ink } from './components/Ink/Ink';
export type { InkProps } from './components/Ink/Ink';
