import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '@rnine/core/kit';
import styles from './Hint.module.scss';

type Props = {
  open: boolean;
  /** The element the hint points at. */
  anchor: RefObject<HTMLElement | null>;
  /** top: above the anchor, pointing down. bottom: below it, pointing up. */
  placement?: 'top' | 'bottom';
  /** Align the hint with the anchor's start or end edge. Default start. */
  align?: 'start' | 'end';
  children: ReactNode;
  onDismiss: () => void;
  dismissLabel?: string;
  /** Hide on its own after this many ms (calls onDismiss). */
  autoHide?: number;
};

const GAP = 14;
const EDGE = 16;

/**
 * A one-time onboarding hint pointing at part of the UI. Show each hint once,
 * only after the person has had a moment to look around (see the brand kit's
 * Patterns). Magenta element: the pointer tick.
 */
export function Hint({ open, anchor, placement = 'top', align = 'start', children, onDismiss, dismissLabel = 'Got it', autoHide }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Position next to the anchor; written straight to the element (no re-render)
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const el = ref.current;
      const a = anchor.current;
      if (!el || !a) return;
      const r = a.getBoundingClientRect();
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const left = Math.max(EDGE, Math.min(window.innerWidth - w - EDGE, align === 'start' ? r.left : r.right - w));
      const top = placement === 'top' ? r.top - h - GAP : r.bottom + GAP;
      const target = align === 'start' ? r.left + 32 : r.left + r.width / 2;
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      el.style.setProperty('--tick-x', `${Math.max(12, Math.min(w - 22, target - left - 5))}px`);
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, { passive: true });
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place);
    };
  }, [open, anchor, placement, align]);

  useEffect(() => {
    if (!open || !autoHide) return;
    const t = window.setTimeout(onDismiss, autoHide);
    return () => window.clearTimeout(t);
  }, [open, autoHide, onDismiss]);

  if (!open) return null;
  return createPortal(
    <div ref={ref} role="status" className={cx(styles.hint, placement === 'top' ? styles.top : styles.bottom)}>
      <div className={styles.body}>{children}</div>
      <button type="button" className={styles.dismiss} onClick={onDismiss}>
        {dismissLabel}
      </button>
    </div>,
    document.body,
  );
}
