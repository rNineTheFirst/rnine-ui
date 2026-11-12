import type { ElementType, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './ListRow.module.scss';

type RowListProps = {
  children: ReactNode;
  /** Accessible name of the list, e.g. "Projects". */
  label?: string;
  className?: string;
};

/** A list of ListRows, separated by hairlines. */
export function RowList({ children, label, className }: RowListProps) {
  return (
    <ul className={cx(styles.list, className)} aria-label={label}>
      {children}
    </ul>
  );
}

type ListRowProps = {
  /** The row's title. It is the link: clicking anywhere on the row opens it. */
  title: ReactNode;
  /** Opens the item (e.g. runs "/open harbor"). Renders the title as a button. */
  onSelect?: () => void;
  /** Or a real URL. Renders the title as a link. */
  href?: string;
  /** Leading column: an index chip ("PRJ_01"). */
  index?: string;
  /** Leading column instead of an index: a date or other short mono text. */
  meta?: ReactNode;
  /** One line under the title. */
  description?: ReactNode;
  /** Extra content under the description, e.g. tags. Keep it non-interactive. */
  children?: ReactNode;
  /** Heading element for the title. Default h3. */
  titleAs?: ElementType;
  className?: string;
};

/**
 * A list row whose title is the link: there are no action buttons on the
 * right, the title (stretched over the whole row) opens the item. Accent
 * element: the title and its arrow on hover and focus.
 */
export function ListRow({ title, onSelect, href, index, meta, description, children, titleAs: Title = 'h3', className }: ListRowProps) {
  const label = (
    <>
      {title}
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
    </>
  );
  return (
    <li className={cx(styles.row, !index && !meta && styles.noLead, className)}>
      {index && <span className={styles.index}>{index}</span>}
      {!index && meta && <span className={styles.meta}>{meta}</span>}
      <div className={styles.body}>
        <Title className={styles.title}>
          {href ? (
            <a className={styles.link} href={href}>
              {label}
            </a>
          ) : (
            <button type="button" className={styles.link} onClick={onSelect}>
              {label}
            </button>
          )}
        </Title>
        {description && <p className={styles.description}>{description}</p>}
        {children && <div className={styles.extra}>{children}</div>}
      </div>
    </li>
  );
}
