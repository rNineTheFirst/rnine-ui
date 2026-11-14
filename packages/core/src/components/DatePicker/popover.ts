import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { popoverHost, useAnchoredPosition } from '../../hooks/anchoredPosition';

/**
 * A picker's popover: opens by its trigger, over everything (inside the
 * dialog around it, if any), and closes on Escape (focus back on the
 * trigger), a press outside, or focus leaving it.
 */
export function usePickerPopover() {
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  useAnchoredPosition(open, triggerRef, popRef);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', down, true);
    return () => document.removeEventListener('pointerdown', down, true);
  }, [open]);

  const show = () => {
    setHost(popoverHost(triggerRef.current));
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const popProps = {
    ref: popRef,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Not also the dialog or drawer around it
      e.preventDefault();
      e.stopPropagation();
      close();
    },
    onBlur: (e: FocusEvent) => {
      const to = e.relatedTarget as Node | null;
      if (!to || popRef.current?.contains(to) || triggerRef.current?.contains(to)) return;
      setOpen(false);
    },
  };

  return { open, host, triggerRef, show, close, toggle: () => (open ? close(false) : show()), popProps };
}
