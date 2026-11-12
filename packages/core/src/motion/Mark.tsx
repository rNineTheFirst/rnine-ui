import { cx } from '../utils/cx';
import { MarkArt, type MarkProps } from '../provider/mark';
import styles from './Mark.module.scss';

/**
 * The app's mark (ThemeProvider mark, or MarkProvider), with the library's
 * animation (Plain: none). Until an app provides one it shows a placeholder
 * frame.
 */
export function Mark({ size = 32, variant = 'full', label, className }: MarkProps) {
  return (
    <span
      className={cx(styles.mark, className)}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <MarkArt variant={variant} />
    </span>
  );
}
