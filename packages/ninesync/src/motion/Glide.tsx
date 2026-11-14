import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { cx } from '@rnine/core/kit';
import { useReducedMotion } from '@rnine/core/motion';
import styles from './Glide.module.scss';

type Box = { x: number; y: number; w: number };

/**
 * Where the mark goes: under the element `selector` finds inside `root`
 * (re-measured when the selection, the size or the scroll changes).
 */
function useGlideBox(root: RefObject<HTMLElement | null>, selector: string): Box | null {
  const [box, setBox] = useState<Box | null>(null);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const target = el.querySelector<HTMLElement>(selector);
      if (!target) return setBox(null);
      const r = el.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      setBox((old) => {
        const next = { x: t.left - r.left, y: t.bottom - r.top, w: t.width };
        return old && old.x === next.x && old.y === next.y && old.w === next.w ? old : next;
      });
    };
    measure();
    const mo = typeof MutationObserver === 'undefined' ? null : new MutationObserver(measure);
    mo?.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-selected', 'aria-current', 'class'] });
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    ro?.observe(el);
    el.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    // Fonts arriving change widths
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      mo?.disconnect();
      ro?.disconnect();
      el.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [root, selector]);
  return box;
}

type Props = {
  children: ReactNode;
  /** The element the mark sits under, found inside: e.g. '[role="tab"][aria-selected="true"]'. */
  selector: string;
  /** The mark's thickness in px. Default 3. */
  thickness?: number;
  /** Space between the element's bottom and the mark, in px (negative overlaps it). Default 0. */
  offset?: number;
  className?: string;
};

/**
 * NineSync's moving mark: a pale bar under the selected tab or the current
 * page, which glides to the new one when the selection changes (260ms). With
 * reduced motion it just moves.
 */
export function Glide({ children, selector, thickness = 3, offset = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const box = useGlideBox(ref, selector);
  const reduced = useReducedMotion();
  // The mark appears in place (a new element doesn't transition), then glides between selections
  const style = box
    ? ({ width: box.w, height: thickness, transform: `translate(${box.x}px, ${box.y + offset - thickness}px)` } as CSSProperties)
    : undefined;
  return (
    <div ref={ref} className={cx(styles.glide, className)}>
      {children}
      {box && <span aria-hidden="true" className={cx(styles.mark, !reduced && styles.moving)} style={style} />}
    </div>
  );
}
