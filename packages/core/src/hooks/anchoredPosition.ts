import { useLayoutEffect, type RefObject } from 'react';

const GAP = 4;

export type AnchoredOptions = {
  /** Which edge of the anchor the popover lines up with. Default start. */
  align?: 'start' | 'end';
  /** Where it opens; it flips when there's no room. Default bottom. */
  placement?: 'bottom' | 'top';
  /** At least as wide as the anchor (a combobox's list). */
  matchWidth?: boolean;
};

/**
 * Where a popover goes: inside the <dialog> around the anchor (the top layer,
 * so it's above a modal and usable), else the body.
 */
export const popoverHost = (el: Element | null | undefined): HTMLElement => el?.closest('dialog') ?? document.body;

/**
 * Places a position: fixed popover by its anchor before it paints, flips it
 * when there's no room, keeps it inside the viewport and follows scrolling
 * and resizing while open. The popover needs position: fixed and top/left 0.
 */
export function useAnchoredPosition(
  open: boolean,
  anchorRef: RefObject<Element | null>,
  popRef: RefObject<HTMLElement | null>,
  { align = 'start', placement = 'bottom', matchWidth = false }: AnchoredOptions = {},
) {
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const a = anchorRef.current;
      const pop = popRef.current;
      if (!a || !pop) return;
      const r = a.getBoundingClientRect();
      if (matchWidth) pop.style.minWidth = `${r.width}px`;
      const h = pop.offsetHeight;
      const w = pop.offsetWidth;
      const below = window.innerHeight - r.bottom - GAP;
      const above = r.top - GAP;
      const up = placement === 'top' ? !(above < h && below > above) : below < h && above > below;
      const top = up ? r.top - GAP - h : r.bottom + GAP;
      const left = align === 'end' ? r.right - w : r.left;
      pop.style.top = `${Math.max(GAP, top)}px`;
      pop.style.left = `${Math.max(GAP, Math.min(left, window.innerWidth - w - GAP))}px`;
    };
    place();
    // Its contents can change while open (a filtered list): place it again when its size does
    const sized = new ResizeObserver(place);
    if (popRef.current) sized.observe(popRef.current);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      sized.disconnect();
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, anchorRef, popRef, align, placement, matchWidth]);
}
