import { useMemo, useRef, useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cx } from '../../utils/cx';
import styles from './Table.module.scss';

type Key = string | number;

const CONTROLS = 'a[href], button, input, select, textarea, label, summary, [role="button"], [role="link"], [role="checkbox"], [contenteditable="true"]';

/** A click or key from a control inside the row (a link, a button): the control's, not the row's. */
function fromControl(e: { target: EventTarget; currentTarget: EventTarget }): boolean {
  const target = e.target as Element;
  if (target === e.currentTarget || !(target instanceof Element)) return false;
  const control = target.closest(CONTROLS);
  return control !== null && (e.currentTarget as Element).contains(control);
}

export type Column<T> = {
  /** Field to show (and sort by), or any unique id when `render` is given. */
  key: string;
  header: ReactNode;
  sortable?: boolean;
  /** Custom cell content. */
  render?: (item: T, index: number) => ReactNode;
  /** Value used for sorting when it differs from item[key]. */
  sortValue?: (item: T) => string | number | Date | null | undefined;
  align?: 'start' | 'end' | 'center';
  /** A column of numbers (quantities, prices): aligned to the end, the sort arrow before the header so the digits line up. */
  numeric?: boolean;
  /**
   * The column's cell in a totals row at the bottom (shown when any column has
   * one): "Total", or a function of the rows, e.g. (rows) => sum(rows).
   */
  footer?: ReactNode | ((rows: T[]) => ReactNode);
  width?: string | number;
  className?: string;
};

export type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => Key;
  /** Visible or screen-reader-only description of the table. */
  caption?: ReactNode;
  hideCaption?: boolean;
  /** Makes rows clickable (and reachable with Tab + Enter). */
  onRowClick?: (item: T, index: number) => void;
  /** Adds a checkbox column. */
  selectable?: boolean;
  selectedRows?: Key[];
  onSelectionChange?: (selected: Key[]) => void;
  /** Accessible name for a row's checkbox, e.g. (item) => `Select ${item.title}`. */
  rowLabel?: (item: T) => string;
  emptyMessage?: ReactNode;
  loading?: boolean;
  compact?: boolean;
  /** Initial sort. */
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  /**
   * Scrolls the rows inside the table at this height ("60dvh", 480), with the
   * header stuck at its top and the totals row at its bottom.
   */
  maxHeight?: string | number;
  className?: string;
};

function Checkbox({ checked, indeterminate, label, onChange }: { checked: boolean; indeterminate?: boolean; label: string; onChange: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      className={styles.check}
      checked={checked}
      aria-label={label}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

/**
 * Data table with sortable columns, row selection and clickable rows; number
 * columns, a totals row, and a header that stays put while the rows scroll
 * (maxHeight).
 * Accent element: the active sort arrow, selected rows' edge and checkboxes.
 */
export function Table<T extends object>({
  data,
  columns,
  keyExtractor,
  caption,
  hideCaption,
  onRowClick,
  selectable,
  selectedRows = [],
  onSelectionChange,
  rowLabel,
  emptyMessage = 'Nothing here yet.',
  loading,
  compact,
  defaultSort,
  maxHeight,
  className,
}: TableProps<T>) {
  const [sort, setSort] = useState(defaultSort);

  const rows = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    const value = (item: T) => (col?.sortValue ? col.sortValue(item) : (item as Record<string, unknown>)[sort.key]);
    const sorted = [...data].sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va instanceof Date && vb instanceof Date) return va.getTime() - vb.getTime();
      if (typeof va === 'number' && typeof vb === 'number') return va - vb;
      return String(va).localeCompare(String(vb), undefined, { numeric: true, sensitivity: 'base' });
    });
    return sort.direction === 'asc' ? sorted : sorted.reverse();
  }, [data, columns, sort]);

  const selected = new Set(selectedRows);
  const allKeys = rows.map(keyExtractor);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selected.has(k));
  const someSelected = allKeys.some((k) => selected.has(k));

  const toggle = (key: Key) =>
    onSelectionChange?.(selected.has(key) ? selectedRows.filter((k) => k !== key) : [...selectedRows, key]);
  const toggleAll = () => onSelectionChange?.(allSelected ? [] : allKeys);

  const cycleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, direction: 'asc' } : s.direction === 'asc' ? { key, direction: 'desc' } : undefined));

  const onRowKey = (e: KeyboardEvent, item: T, i: number) => {
    if (fromControl(e)) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRowClick?.(item, i);
    }
  };

  const span = columns.length + (selectable ? 1 : 0);
  const alignOf = (c: Column<T>) => styles[c.align ?? (c.numeric ? 'end' : 'start')];
  const showFooter = !loading && rows.length > 0 && columns.some((c) => c.footer !== undefined);

  return (
    <div className={cx(styles.wrap, maxHeight !== undefined && styles.scroll, className)} style={maxHeight !== undefined ? { maxHeight } : undefined}>
      <table className={cx(styles.table, compact && styles.compact)} aria-busy={loading || undefined}>
        {caption && <caption className={cx(styles.caption, hideCaption && styles.hidden)}>{caption}</caption>}
        <thead>
          <tr>
            {selectable && (
              <th scope="col" className={styles.checkCell}>
                <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} label="Select all rows" onChange={toggleAll} />
              </th>
            )}
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const Icon = !active ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown;
              return (
                <th
                  key={c.key}
                  scope="col"
                  style={{ width: c.width }}
                  className={cx(alignOf(c), c.numeric && styles.numeric, c.className)}
                  aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : c.sortable ? 'none' : undefined}
                >
                  {c.sortable ? (
                    <button type="button" className={cx(styles.sort, active && styles.sorted)} onClick={() => cycleSort(c.key)}>
                      {c.header}
                      <Icon className={styles.sortIcon} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 3 }, (_, i) => (
              <tr key={`loading-${i}`} className={styles.loadingRow}>
                <td colSpan={span}><span className={styles.bar} /></td>
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={span} className={styles.empty}>{emptyMessage}</td>
            </tr>
          ) : (
            rows.map((item, i) => {
              const key = keyExtractor(item);
              const isSelected = selected.has(key);
              return (
                <tr
                  key={key}
                  className={cx(onRowClick && styles.clickable, isSelected && styles.selected)}
                  onClick={onRowClick ? (e) => !fromControl(e) && onRowClick(item, i) : undefined}
                  onKeyDown={onRowClick ? (e) => onRowKey(e, item, i) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-selected={selectable ? isSelected : undefined}
                >
                  {selectable && (
                    <td className={styles.checkCell}>
                      <Checkbox checked={isSelected} label={rowLabel ? rowLabel(item) : `Select row ${i + 1}`} onChange={() => toggle(key)} />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={cx(alignOf(c), c.numeric && styles.numeric, c.className)}>
                      {c.render ? c.render(item, i) : String((item as Record<string, unknown>)[c.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
        {showFooter && (
          <tfoot>
            <tr>
              {selectable && <td className={styles.checkCell} />}
              {columns.map((c) => (
                <td key={c.key} className={cx(alignOf(c), c.numeric && styles.numeric, c.className)}>
                  {typeof c.footer === 'function' ? c.footer(rows) : c.footer}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
