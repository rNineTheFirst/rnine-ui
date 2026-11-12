import { cx } from '../utils/cx';
import styles from './Backdrop.module.scss';

export type BackdropProps = {
  /** Spacing of the field, in px. Default 22. */
  gap?: number;
  /** How far the pointer's influence reaches, in px (for libraries whose backdrop reacts). Default 150. */
  reach?: number;
  /** Cover the viewport behind the page instead of the nearest positioned parent. */
  fixed?: boolean;
};

/**
 * The library's backdrop behind content (NineOS: the reactive dot field).
 * Plain: a still dotted field.
 */
export function Backdrop({ gap = 22, fixed = false }: BackdropProps) {
  return <span aria-hidden="true" className={cx(styles.backdrop, fixed && styles.fixed)} style={{ backgroundSize: `${gap}px ${gap}px` }} />;
}
