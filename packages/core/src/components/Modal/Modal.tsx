import { useEffect, useId, useRef, type MouseEvent, type ReactNode, type SyntheticEvent } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../utils/cx';
import styles from './Modal.module.scss';

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Heading; also the dialog's accessible name. */
  title?: ReactNode;
  children: ReactNode;
  /** Actions row (e.g. Cancel + Save buttons). */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Close when the dim backdrop is clicked. Default true. */
  closeOnOverlay?: boolean;
  /** Close on Escape. Default true. */
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
};

/**
 * A modal dialog on the native <dialog> element: focus moves in and stays in,
 * the page behind is inert, focus returns to the trigger on close.
 * Accent element: the mark after the title (and the lit corner).
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  closeOnEsc = true,
  showCloseButton = true,
  className,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // Escape fires "cancel": close through the parent so state stays in sync
  const onCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    if (closeOnEsc) onClose();
  };

  // A click on the dialog element itself (not its content) is a backdrop click
  const onClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (closeOnOverlay && e.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={cx(styles.dialog, styles[size], className)}
      aria-labelledby={title ? titleId : undefined}
      onCancel={onCancel}
      onClick={onClick}
    >
      {isOpen && (
        <div className={styles.panel}>
          {(title || showCloseButton) && (
            <header className={styles.header}>
              {title && <h2 id={titleId} className={styles.title}>{title}</h2>}
              {showCloseButton && (
                <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
                  <X strokeWidth={1.5} aria-hidden="true" />
                </button>
              )}
            </header>
          )}
          <div className={styles.body}>{children}</div>
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
