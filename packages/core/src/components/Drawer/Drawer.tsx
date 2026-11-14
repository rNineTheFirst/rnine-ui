import { useEffect, useId, useRef, type KeyboardEvent, type MouseEvent, type ReactNode, type SyntheticEvent } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../utils/cx';
import styles from './Drawer.module.scss';

export type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Heading (an h2); also the drawer's accessible name. */
  title?: ReactNode;
  /** Under the title: a record's code and kind, "PL-10-1220 · Plates". */
  description?: ReactNode;
  children: ReactNode;
  /** Actions pinned to the bottom (Edit, Create PO). */
  footer?: ReactNode;
  /** The edge it slides in from. Default end (the right in left-to-right pages). */
  side?: 'start' | 'end';
  /** Width from the sm breakpoint; below it the drawer is full width. Default md. */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Default true: the page behind is dimmed and inert and focus stays in the
   * drawer, like a Modal. false: the page stays usable beside it, so picking
   * another row in a list swaps the record shown.
   */
  modal?: boolean;
  /** A click on the dimmed page closes it (modal only). Default true. */
  closeOnOverlay?: boolean;
  /** Escape closes it. Default true. */
  closeOnEsc?: boolean;
  /** Name of the close button. Default "Close". */
  closeLabel?: string;
  className?: string;
};

/**
 * A panel that slides in from the side of the page with a record's details
 * beside its list, on the native <dialog> element: focus moves in, Escape
 * closes it, focus goes back on close. Modal by default; `modal={false}`
 * keeps the page usable next to it. Below the sm breakpoint it's full width.
 * Accent element: the mark after the title.
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'end',
  size = 'md',
  modal = true,
  closeOnOverlay = true,
  closeOnEsc = true,
  closeLabel = 'Close',
  className,
}: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      if (modal) dialog.showModal();
      else dialog.show();
    }
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen, modal]);

  // Closes if it unmounts open, so focus goes back
  useEffect(() => {
    const dialog = ref.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  // Escape on a modal dialog fires "cancel": close through the parent so state stays in sync
  const onCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    if (closeOnEsc) onClose();
  };

  // A non-modal dialog gets no "cancel", so Escape is handled here
  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (modal || e.key !== 'Escape' || e.defaultPrevented) return;
    e.preventDefault();
    if (closeOnEsc) onClose();
  };

  // A click on the dialog element itself (not the panel) is a backdrop click
  const onClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (modal && closeOnOverlay && e.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={cx(styles.drawer, styles[side], styles[size], !modal && styles.inline, className)}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={onCancel}
      onKeyDown={onKeyDown}
      onClick={onClick}
    >
      {isOpen && (
        <div className={styles.panel}>
          <header className={styles.header}>
            <div className={styles.heading}>
              {title && <h2 id={titleId} className={styles.title}>{title}</h2>}
              {description && <p id={descriptionId} className={styles.description}>{description}</p>}
            </div>
            <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
              <X strokeWidth={1.5} aria-hidden="true" />
            </button>
          </header>
          <div className={styles.body}>{children}</div>
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
