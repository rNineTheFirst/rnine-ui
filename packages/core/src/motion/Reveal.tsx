import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '../hooks/motion';
import styles from './Reveal.module.scss';

type Props = { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'section' | 'li' };

/**
 * Slides content up 14px as it scrolls into view. Content is visible at rest:
 * only things that start below the fold animate, so nothing waits on JS.
 */
export function Reveal({ children, delay = 0, className, as: Tag = 'div' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || el.getBoundingClientRect().top < window.innerHeight) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      el.style.animationDelay = `${delay}ms`;
      el.classList.add(styles.in);
      io.disconnect();
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, delay]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
