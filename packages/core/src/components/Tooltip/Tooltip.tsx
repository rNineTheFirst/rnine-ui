import { cloneElement, isValidElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Tooltip.module.scss';

type Props = {
  /** Short supporting text. Never put essential information only here. */
  content: ReactNode;
  /** One focusable element (a button or link) that the tooltip describes. */
  children: ReactElement<{ 'aria-describedby'?: string }>;
  placement?: 'top' | 'bottom';
  /** Milliseconds before showing on hover. Keyboard focus shows it at once. */
  delay?: number;
  className?: string;
};

/**
 * A tooltip on hover and keyboard focus; Escape hides it. The trigger is
 * described by it (aria-describedby). Accent element: the pointer tick.
 */
export function Tooltip({ content, children, placement = 'top', delay = 300, className }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef(0);

  const show = (wait: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), wait);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && hide();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const trigger = isValidElement(children)
    ? cloneElement(children, { 'aria-describedby': cx(children.props['aria-describedby'], id) || undefined })
    : children;

  return (
    <span
      className={cx(styles.wrap, className)}
      onPointerEnter={() => show(delay)}
      onPointerLeave={hide}
      onFocus={() => show(0)}
      onBlur={hide}
    >
      {trigger}
      <span id={id} role="tooltip" className={cx(styles.tip, styles[placement], open && styles.open)}>
        {content}
      </span>
    </span>
  );
}
