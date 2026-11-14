import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { cx } from '../../utils/cx';
import type { RenderLink } from '../../utils/link';
import { Skeleton } from '../Skeleton/Skeleton';
import styles from './StatTile.module.scss';

export type StatChange = {
  /** Already formatted: "12%", "+4", "₱18,200". */
  value: string;
  direction: 'up' | 'down' | 'flat';
  /**
   * Whether the change is good news. Separate from the direction: more items
   * below their reorder point is up but bad. Default: up is positive, down is
   * negative, flat is neutral.
   */
  tone?: 'positive' | 'negative' | 'neutral';
};

type Props = {
  /** What's counted: "Items below reorder point". */
  label: string;
  /** Already formatted: "₱1,240,500", "7". */
  value: ReactNode;
  /** Change against an earlier period. */
  change?: StatChange;
  /** Small text under the value: "vs last month", "3 overdue". */
  hint?: ReactNode;
  /** An icon beside the label, e.g. a lucide-react icon. */
  icon?: ReactNode;
  /** Draws the value in the warning or danger color, for counts that need action. */
  tone?: 'default' | 'warning' | 'danger';
  /** Makes the whole tile a link, e.g. to the list behind the number. */
  href?: string;
  /** Draws the link with your router instead of plain <a>. */
  renderLink?: RenderLink;
  /** Skeletons in place of the value while it loads. */
  loading?: boolean;
  className?: string;
};

const ARROW = { up: ArrowUpRight, down: ArrowDownRight, flat: ArrowRight };
const SAID = { up: 'Up', down: 'Down', flat: 'No change,' };
const DEFAULT_TONE = { up: 'positive', down: 'negative', flat: 'neutral' } as const;

/**
 * One number for a dashboard: a label, the value, its change and a hint, as a
 * card, optionally a link to what's behind it. The change reads as an arrow
 * and words, never by color alone. Accent element: the card's corner ornament.
 */
export function StatTile({ label, value, change, hint, icon, tone = 'default', href, renderLink, loading, className }: Props) {
  const Arrow = change && ARROW[change.direction];
  const content = (
    <>
      <span className={styles.top}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      </span>
      {loading ? (
        <>
          <Skeleton className={styles.valueSkeleton} lines={1} width="55%" />
          <Skeleton lines={1} width="35%" />
        </>
      ) : (
        <>
          <span className={cx(styles.value, tone !== 'default' && styles[tone])}>{value}</span>
          {(change || hint) && (
            <span className={styles.foot}>
              {change && Arrow && (
                <span className={cx(styles.change, styles[change.tone ?? DEFAULT_TONE[change.direction]])}>
                  <Arrow strokeWidth={2} aria-hidden="true" />
                  <span className={styles.sr}>{SAID[change.direction]} </span>
                  {change.value}
                </span>
              )}
              {hint && <span className={styles.hint}>{hint}</span>}
            </span>
          )}
        </>
      )}
    </>
  );

  const classes = cx(styles.tile, href && styles.linked, className);
  if (href) {
    const props = { href, className: classes, 'aria-busy': loading || undefined, children: content };
    return renderLink ? renderLink(props) : <a {...props} />;
  }
  return (
    <div className={classes} aria-busy={loading || undefined}>
      {content}
    </div>
  );
}
