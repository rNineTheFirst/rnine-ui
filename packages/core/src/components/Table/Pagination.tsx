import { useId } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../utils/cx';
import { pageList } from '../../utils/pageList';
import styles from './Pagination.module.scss';

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** With itemsPerPage: shows "21-40 of 132". */
  totalItems?: number;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showTotalItems?: boolean;
  showItemsPerPageSelector?: boolean;
  itemsPerPageOptions?: number[];
  label?: string;
  className?: string;
};

/** Page navigation for tables and lists. Accent element: the current page. */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  showTotalItems = true,
  showItemsPerPageSelector = false,
  itemsPerPageOptions = [10, 20, 50],
  label = 'Pagination',
  className,
}: PaginationProps) {
  const selectId = useId();
  const go = (p: number) => p >= 1 && p <= totalPages && p !== currentPage && onPageChange(p);
  const from = totalItems && itemsPerPage ? Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1) : 0;
  const to = totalItems && itemsPerPage ? Math.min(totalItems, currentPage * itemsPerPage) : 0;

  return (
    <div className={cx(styles.bar, className)}>
      {showTotalItems && totalItems !== undefined && itemsPerPage && (
        <p className={styles.total}>
          {totalItems === 0 ? 'No items' : `${from}–${to} of ${totalItems}`}
        </p>
      )}

      {showItemsPerPageSelector && onItemsPerPageChange && (
        <label className={styles.perPage} htmlFor={selectId}>
          Rows
          <select id={selectId} value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))}>
            {itemsPerPageOptions.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      )}

      {totalPages > 1 && (
        <nav aria-label={label} className={styles.nav}>
          <button type="button" className={styles.step} onClick={() => go(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page">
            <ChevronLeft strokeWidth={1.5} aria-hidden="true" />
          </button>
          <ol className={styles.pages}>
            {pageList(currentPage, totalPages).map((p, i) =>
              p === null ? (
                <li key={`gap-${i}`} className={styles.gap} aria-hidden="true">…</li>
              ) : (
                <li key={p}>
                  <button
                    type="button"
                    className={cx(styles.page, p === currentPage && styles.current)}
                    aria-current={p === currentPage ? 'page' : undefined}
                    aria-label={`Page ${p}`}
                    onClick={() => go(p)}
                  >
                    {p}
                  </button>
                </li>
              ),
            )}
          </ol>
          <button type="button" className={styles.step} onClick={() => go(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Next page">
            <ChevronRight strokeWidth={1.5} aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
}
