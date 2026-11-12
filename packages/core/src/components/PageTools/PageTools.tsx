import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useReducedMotion } from '../../hooks/motion';
import { cx } from '../../utils/cx';
import styles from './PageTools.module.scss';

type SkipLinkProps = {
  /** Id of the main content element (without #). Default "main". */
  target?: string;
  children?: string;
};

/**
 * First thing in the page: invisible until a keyboard user tabs to it, then
 * jumps past the navigation. Accent element: its fill.
 */
export function SkipLink({ target = 'main', children = 'Skip to content' }: SkipLinkProps) {
  return (
    <a href={`#${target}`} className={styles.skip}>
      {children}
    </a>
  );
}

type BackToTopProps = {
  /** Show after scrolling this many pixels. Default 600. */
  threshold?: number;
  label?: string;
  className?: string;
};

/** Floating button back to the top, shown after scrolling down. Accent element: its arrow tile. */
export function BackToTop({ threshold = 600, label = 'Back to top', className }: BackToTopProps) {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return (
    <button
      type="button"
      className={cx(styles.top, visible && styles.visible, className)}
      onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
      aria-label={label}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible || undefined}
    >
      <ArrowUp strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
