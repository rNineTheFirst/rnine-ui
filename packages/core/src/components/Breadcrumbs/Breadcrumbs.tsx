import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Breadcrumbs.module.scss';

export type BreadcrumbItem = { label: string; href?: string };

type Props = {
  /** From the top level down to the current page (the last item, which gets no link). */
  items: BreadcrumbItem[];
  /** Accessible name of the navigation. */
  label?: string;
  /**
   * Render links with your router instead of plain <a>:
   * renderLink={(item, children) => <Link to={item.href!}>{children}</Link>}
   */
  renderLink?: (item: BreadcrumbItem, children: ReactNode) => ReactNode;
  className?: string;
};

/** Where this page sits. Accent element: the "/" separators. */
export function Breadcrumbs({ items, label = 'Breadcrumb', renderLink, className }: Props) {
  return (
    <nav aria-label={label} className={cx(styles.nav, className)}>
      <ol className={styles.list}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className={styles.item}>
              {last || !item.href ? (
                <span aria-current={last ? 'page' : undefined} className={last ? styles.current : undefined}>
                  {item.label}
                </span>
              ) : renderLink ? (
                renderLink(item, item.label)
              ) : (
                <a href={item.href}>{item.label}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
