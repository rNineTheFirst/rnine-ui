import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '@rnine/core/kit';
import styles from './Chrome.module.scss';

type DockProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode; /** Accessible name of the region. */ label?: string };

/**
 * The bar pinned to the bottom of the screen (thumb reach on phones): holds
 * the CommandLine, or menu chips in Menu mode. Glass over the dot field.
 * Publishes its height as --r9-dock-h on <html>, so pages can pad for it.
 */
export function Dock({ children, label = 'Command dock', className, ...rest }: DockProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty('--r9-dock-h', `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--r9-dock-h');
    };
  }, []);
  return (
    <div {...rest} ref={ref} role="region" aria-label={label} className={cx(styles.dock, className)}>
      <div className={styles.dockInner}>{children}</div>
    </div>
  );
}

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type HudProps = HTMLAttributes<HTMLDivElement> & { corner: Corner; children: ReactNode };

/**
 * A corner slot for the always-there essentials (monogram, clock, switches).
 * NineOS apps use corner HUDs instead of a navbar.
 */
export function Hud({ corner, children, className, ...rest }: HudProps) {
  return (
    <div {...rest} className={cx(styles.hud, styles[corner.replace('-', '')], className)}>
      {children}
    </div>
  );
}

/** A keyboard key, e.g. <Kbd>Ctrl K</Kbd>. */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return <kbd className={cx(styles.kbd, className)}>{children}</kbd>;
}
