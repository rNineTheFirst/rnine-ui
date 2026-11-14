import { useId, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { LinkProps, RenderLink } from '../../utils/link';
import { useAppShell } from './appShellContext';
import styles from './SideNav.module.scss';

export type SideNavItem = {
  key: string;
  label: string;
  /** Makes the item a link (hash routes work as plain links); without it, a button that calls onSelect. */
  href?: string;
  /** An icon before the label, e.g. a lucide-react icon. */
  icon?: ReactNode;
  /** A count beside the label, e.g. 3 orders awaiting approval. */
  badge?: ReactNode;
  /** What the badge means, for screen readers ("3 awaiting approval"); read instead of the bare badge. */
  badgeLabel?: string;
  disabled?: boolean;
};

export type SideNavGroup = {
  key: string;
  /** Small heading above the group's items. */
  label?: string;
  items: SideNavItem[];
};

type Props = {
  groups: SideNavGroup[];
  /** The item for the page that's open, if any. */
  activeKey?: string | null;
  /** Called when an item is picked (links and buttons). */
  onSelect?: (key: string) => void;
  /** Draws the item links with your router instead of plain <a>. */
  renderLink?: RenderLink;
  /** Pinned below the groups: account details, a version, "Reset demo data". */
  footer?: ReactNode;
  /** Accessible name of the navigation. Default "Main". */
  label?: string;
  className?: string;
};

/**
 * An app's main navigation, for AppShell's sidebar: items with icons and
 * counts, in groups with small headings. Picking an item closes the sidebar
 * where it slides in. Accent element: the active item's edge bar.
 */
export function SideNav({ groups, activeKey, onSelect, renderLink, footer, label = 'Main', className }: Props) {
  const shell = useAppShell();
  const baseId = useId();

  const pick = (key: string) => {
    onSelect?.(key);
    shell?.closeNav();
  };

  const entry = (item: SideNavItem) => {
    const current = item.key === activeKey ? ('page' as const) : undefined;
    const content = (
      <>
        {item.icon && <span className={styles.icon} aria-hidden="true">{item.icon}</span>}
        <span className={styles.label}>{item.label}</span>
        {item.badge != null && (
          <span className={styles.badge}>
            <span aria-hidden={item.badgeLabel ? true : undefined}>{item.badge}</span>
            {item.badgeLabel && <span className={styles.sr}>{` (${item.badgeLabel})`}</span>}
          </span>
        )}
      </>
    );

    if (item.disabled) {
      return (
        <span className={cx(styles.item, styles.disabled)} aria-disabled="true">
          {content}
        </span>
      );
    }
    if (item.href) {
      const props: LinkProps = { href: item.href, className: styles.item, 'aria-current': current, onClick: () => pick(item.key), children: content };
      return renderLink ? renderLink(props) : <a {...props} />;
    }
    return (
      <button type="button" className={styles.item} aria-current={current} onClick={() => pick(item.key)}>
        {content}
      </button>
    );
  };

  return (
    <nav aria-label={label} className={cx(styles.nav, className)}>
      <div className={styles.groups}>
        {groups.map((group) => {
          const headingId = `${baseId}${group.key}`;
          return (
            <div key={group.key} className={styles.group}>
              {group.label && <p id={headingId} className={styles.heading}>{group.label}</p>}
              <ul className={styles.list} aria-labelledby={group.label ? headingId : undefined}>
                {group.items.map((item) => (
                  <li key={item.key}>{entry(item)}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </nav>
  );
}
