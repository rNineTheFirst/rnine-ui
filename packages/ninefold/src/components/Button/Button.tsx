import type { PointerEvent } from 'react';
import { Button as CoreButton, type ButtonProps } from '@rnine/core';
import { cx } from '@rnine/core/kit';
import { useReducedMotion } from '@rnine/core/motion';
import styles from './Button.module.scss';

/** How far the wax ring spreads on a press, in multiples of its 40px start (tuned). */
const RING = 2.4;

/** A wax stamp at the press: the button squashes and a ring of wax spreads from the pointer. */
function stamp(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  if (typeof el.animate !== 'function') return;
  el.animate([{ scale: 1 }, { scale: 0.95, offset: 0.35 }, { scale: 1.02, offset: 0.7 }, { scale: 1 }], { duration: 420, easing: 'ease-out' });
  // The ring floats above the page, so a button's rounded clip doesn't cut it off
  const s = getComputedStyle(el);
  const wax = (name: string) => s.getPropertyValue(`--r9-${name}`).trim();
  const ring = document.createElement('span');
  ring.setAttribute('aria-hidden', 'true');
  ring.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;pointer-events:none;z-index:${wax('z-fx') || 70};background:radial-gradient(circle, transparent 38%, ${wax('wax-light')} 46%, ${wax('wax')} 60%, ${wax('wax-dark')} 72%, transparent 76%)`;
  document.body.appendChild(ring);
  const grow = ring.animate([{ scale: 0.3, opacity: 0.95 }, { scale: RING, opacity: 0 }], { duration: 720, easing: 'cubic-bezier(.2,.7,.3,1)' });
  grow.onfinish = grow.oncancel = () => ring.remove();
}

/**
 * Buttons and button-styled links (pass `href` for a link). Pressing one
 * stamps it like a seal: it squashes and a ring of wax spreads from the
 * press. secondary is a quiet outlined button; ghost is text that a pen
 * underlines on hover. Wrap one in Magnet to have it lean toward the pointer.
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className } = props;
  const reduced = useReducedMotion();
  const own = props.onPointerDown as ((e: PointerEvent<HTMLElement>) => void) | undefined;
  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (!reduced && e.button === 0) stamp(e);
    own?.(e);
  };
  return <CoreButton {...(props as ButtonProps)} className={cx(styles[variant], styles[size], className)} onPointerDown={onPointerDown as never} />;
}
