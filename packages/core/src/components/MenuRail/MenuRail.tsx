import { useTheme } from '../../provider/ThemeProvider';
import { cx } from '../../utils/cx';
import styles from './MenuRail.module.scss';

export type MenuRailItem = { key: string; label: string };

type Props = {
  items: MenuRailItem[];
  /** The item whose panel is open, if any. */
  activeKey?: string | null;
  onSelect: (key: string) => void;
  /** Accessible name. Default "Menu". */
  label?: string;
  className?: string;
};

/**
 * A vertical, game-style menu: numbered entries in wide display type, an
 * alternative to a navbar (NineOS uses it in Menu mode, without the command line).
 * Accent element: the active entry's bar and number.
 */
export function MenuRail({ items, activeKey, onSelect, label = 'Menu', className }: Props) {
  const { TextReveal } = useTheme().slots;
  return (
    <nav aria-label={label} className={cx(styles.rail, className)}>
      <ol className={styles.list}>
        {items.map((item, i) => (
          <li key={item.key}>
            <button
              type="button"
              className={styles.item}
              aria-current={item.key === activeKey ? 'page' : undefined}
              onClick={() => onSelect(item.key)}
            >
              <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
              <TextReveal className={styles.label} text={item.label} trigger="hover" />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
