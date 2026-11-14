import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './PageHeader.module.scss';

type Props = {
  /** The page's name: its h1. */
  title: ReactNode;
  /** One or two sentences under the title. */
  description?: ReactNode;
  /** Above the title: Breadcrumbs or a back link. */
  breadcrumbs?: ReactNode;
  /** Beside the title: a Status or Tag ("Awaiting approval"). */
  meta?: ReactNode;
  /** The page's actions, at the end of the row (wraps under the title on narrow screens): Buttons, a Menu. */
  actions?: ReactNode;
  className?: string;
};

/**
 * The top of an app page: breadcrumbs, the title (the page's h1) with its
 * status, a description and the page's actions. Accent element: the mark
 * after the title.
 */
export function PageHeader({ title, description, breadcrumbs, meta, actions, className }: Props) {
  return (
    <header className={cx(styles.header, className)}>
      {breadcrumbs && <div className={styles.crumbs}>{breadcrumbs}</div>}
      <div className={styles.row}>
        <div className={styles.text}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
            {meta && <div className={styles.meta}>{meta}</div>}
          </div>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
}
