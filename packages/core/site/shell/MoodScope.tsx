import type { ReactNode } from 'react';
import styles from './shell.module.scss';

type Props = { mood: 'light' | 'dark'; label?: string; children: ReactNode; className?: string };

/** Renders its children in one mood, whatever the page's mood is. */
export function MoodScope({ mood, label, children, className }: Props) {
  return (
    <div data-scheme={mood} className={[styles.scope, className].filter(Boolean).join(' ')}>
      {label && <span className={styles.scopeLabel}>{label}</span>}
      {children}
    </div>
  );
}
