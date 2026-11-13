import { useEffect, useState, type RefObject } from 'react';
import { isNight } from './paint';

/**
 * True while the element shows Gloam (the night mood): its computed
 * color-scheme is dark. Follows the mood as it changes (data-scheme on
 * <html> or a scope, or the system setting).
 */
export function useNight(ref: RefObject<Element | null>): boolean {
  const [night, setNight] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setNight(isNight(el));
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['data-scheme'] });
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    mq?.addEventListener?.('change', check);
    return () => {
      mo.disconnect();
      mq?.removeEventListener?.('change', check);
    };
  }, [ref]);
  return night;
}
