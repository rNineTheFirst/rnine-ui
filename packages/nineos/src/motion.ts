// @rnine/nineos/motion: the NineOS motion layer. Every @rnine/core/motion
// export, with NineOS's own effects in the roles: TextReveal decodes from
// terminal symbols, Backdrop is the reactive dot field, Mark glitches, the
// panel swap is the signal swap, PageEffects are Cipher scanlines and magenta
// click sparks. Every effect stops when the system asks for reduced motion
// (or ThemeProvider reducedMotion is on).

export * from '@rnine/core/motion';

export { TextReveal } from './motion/DecryptText';
export { useTextReveal } from './motion/useDecrypt';
export { Backdrop } from './motion/DotField';
export { Mark } from './motion/Monogram';
export { PageEffects } from './motion/PageEffects';
export { swapIn, swapOut, SWAP_IN_MS, SWAP_OUT_MS } from './motion/signal';

// NineOS only
export { Terminal } from './motion/Terminal';
export type { TerminalLine } from './motion/Terminal';
export { VelocityStrip } from './motion/VelocityStrip';
