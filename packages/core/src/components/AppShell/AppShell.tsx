import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Menu as MenuIcon, X } from 'lucide-react';
import { cx } from '../../utils/cx';
import { SkipLink } from '../PageTools/PageTools';
import { AppShellContext } from './appShellContext';
import styles from './AppShell.module.scss';

type Props = {
  /** Top of the sidebar: the app's or client's logo or wordmark. */
  brand?: ReactNode;
  /** The sidebar's contents, usually a SideNav. */
  nav: ReactNode;
  /** Left side of the top bar, which grows: search, breadcrumbs. */
  header?: ReactNode;
  /** Right side of the top bar: the user menu, notifications. */
  actions?: ReactNode;
  /** The page. */
  children: ReactNode;
  /** Name of the button that opens the navigation on narrow screens. Default "Menu". */
  navToggleLabel?: string;
  /** Name of the button that closes it. Default "Close menu". */
  navCloseLabel?: string;
  /** id of <main>, which the built-in skip link jumps to. Default "main". */
  mainId?: string;
  /** Text of the skip link. Default "Skip to content". */
  skipLabel?: string;
  className?: string;
};

/**
 * The layout of an internal tool or admin app: a sidebar with the navigation,
 * a top bar (search, user menu) and the page. From the md breakpoint the
 * sidebar is always shown; below it, a menu button in the top bar slides it
 * in over the page (Escape, the close button or a tap outside closes it, and
 * picking a SideNav item does too). Starts with a skip link to the page.
 * Accent element: none of its own (the SideNav's active item carries it).
 */
export function AppShell({
  brand,
  nav,
  header,
  actions,
  children,
  navToggleLabel = 'Menu',
  navCloseLabel = 'Close menu',
  mainId = 'main',
  skipLabel = 'Skip to content',
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const sidebarId = useId();

  // Closed by the viewer (Escape, the close button, a tap outside): back to the menu button
  const dismiss = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Closed by picking a page: focus goes to the page, which is what changed
  const closeNav = useCallback(() => {
    if (!openRef.current) return;
    setOpen(false);
    mainRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss();
    // Widened past the breakpoint while open: the sidebar is shown anyway, so drop the overlay
    const onResize = () => {
      const toggle = toggleRef.current;
      if (toggle && getComputedStyle(toggle).display === 'none') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open, dismiss]);

  const context = useMemo(() => ({ closeNav }), [closeNav]);

  return (
    <AppShellContext.Provider value={context}>
      <div className={cx(styles.shell, open && styles.open, className)}>
        <SkipLink target={mainId}>{skipLabel}</SkipLink>
        <div id={sidebarId} className={styles.sidebar}>
          <div className={styles.sideHead}>
            {brand && <div className={styles.brand}>{brand}</div>}
            <button ref={closeRef} type="button" className={cx(styles.iconButton, styles.close)} aria-label={navCloseLabel} onClick={dismiss}>
              <X strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
          <div className={styles.sideBody}>{nav}</div>
        </div>
        {open && <div className={styles.scrim} aria-hidden="true" onClick={dismiss} />}
        <div className={styles.column} inert={open || undefined}>
          <header className={styles.topbar}>
            <button
              ref={toggleRef}
              type="button"
              className={cx(styles.iconButton, styles.toggle)}
              aria-label={navToggleLabel}
              aria-expanded={open}
              aria-controls={sidebarId}
              onClick={() => setOpen(true)}
            >
              <MenuIcon strokeWidth={1.5} aria-hidden="true" />
            </button>
            <div className={styles.header}>{header}</div>
            {actions && <div className={styles.actions}>{actions}</div>}
          </header>
          <main ref={mainRef} id={mainId} tabIndex={-1} className={styles.main}>
            {children}
          </main>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}
