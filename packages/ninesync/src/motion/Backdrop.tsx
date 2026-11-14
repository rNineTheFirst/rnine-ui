import type { BackdropProps } from '@rnine/core/motion';
import { cx } from '@rnine/core/kit';
import styles from './Backdrop.module.scss';

/**
 * NineSync's backdrop: the plain page. Nothing moves on its own in NineSync
 * except the live dot (LiveDot), so the backdrop is a still layer in the
 * page color. Kept for the shared role: an app that switches libraries keeps
 * its Backdrop where it is.
 */
export function Backdrop({ fixed = false }: BackdropProps) {
  return <span aria-hidden="true" className={cx(styles.backdrop, fixed && styles.fixed)} />;
}
