import type { HTMLAttributes, ReactNode } from 'react';
import { Check, Info, OctagonAlert, TriangleAlert, X } from 'lucide-react';
import { cx } from '../../utils/cx';
import styles from './Alert.module.scss';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  tone?: AlertTone;
  title: ReactNode;
  children?: ReactNode;
  /** Shows a close button. */
  onDismiss?: () => void;
  /** Buttons or links under the message. */
  actions?: ReactNode;
};

const ICONS = { info: Info, success: Check, warning: TriangleAlert, danger: OctagonAlert };

/**
 * A message about something that happened or needs attention. Status color
 * on the edge and icon, never color alone. Accent element: the mark after
 * the title. Danger alerts interrupt screen readers; the rest are polite.
 */
export function Alert({ tone = 'info', title, children, onDismiss, actions, className, ...rest }: Props) {
  const Icon = ICONS[tone];
  return (
    <div {...rest} role={tone === 'danger' ? 'alert' : 'status'} className={cx(styles.alert, styles[tone], className)}>
      <Icon className={styles.icon} strokeWidth={1.5} aria-hidden="true" />
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {children && <div className={styles.message}>{children}</div>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {onDismiss && (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss">
          <X strokeWidth={1.5} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
