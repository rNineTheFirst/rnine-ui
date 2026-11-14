import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './EmptyState.module.scss';

type Props = {
  /** What's empty, plainly: "No purchase orders yet", "No materials match “bolt”". */
  title: string;
  /** Why, or what to do next. */
  description?: ReactNode;
  /** An icon above the title, e.g. a lucide-react icon. */
  icon?: ReactNode;
  /** One or two Buttons: "Create order", "Clear filters". */
  action?: ReactNode;
  /** sm fits inside a Table (its emptyMessage), a Drawer or a card. Default md. */
  size?: 'sm' | 'md';
  /** Heading level of the title. Default 3. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
};

/**
 * What a list, table or search shows when there's nothing in it: an icon, what
 * is empty, why, and what to do. Accent element: the mark on the icon's
 * frame (above the title when there's no icon).
 */
export function EmptyState({ title, description, icon, action, size = 'md', headingLevel = 3, className }: Props) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={cx(styles.empty, styles[size], className)}>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">{icon}</span>
      ) : (
        <span className={styles.mark} aria-hidden="true" />
      )}
      <Heading className={styles.title}>{title}</Heading>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
