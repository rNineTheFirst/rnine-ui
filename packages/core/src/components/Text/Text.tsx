import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Text.module.scss';

export type TextVariant =
  | 'display' | 'h1' | 'h2' | 'h3' | 'h4'
  | 'body-lg' | 'body' | 'body-sm'
  | 'label' | 'code' | 'caption';

export type TextTone = 'default' | 'muted' | 'accent' | 'signal';

type Props = HTMLAttributes<HTMLElement> & {
  /** A type role. Headings use the display font, body the body font, label/code/caption the mono font. */
  variant?: TextVariant;
  /** Element to render. Defaults to a sensible one for the variant (h1-h4, p, span). */
  as?: ElementType;
  /** accent is accent text; signal is the signal color, for live data only. */
  tone?: TextTone;
  /** Keep to a readable line length (65 characters). */
  measure?: boolean;
  children?: ReactNode;
};

const DEFAULT_TAG: Record<TextVariant, ElementType> = {
  display: 'h1', h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4',
  'body-lg': 'p', body: 'p', 'body-sm': 'p',
  label: 'span', code: 'code', caption: 'span',
};

/** Text in a type role. */
export function Text({ variant = 'body', as, tone = 'default', measure, className, children, ...rest }: Props) {
  const Tag = as ?? DEFAULT_TAG[variant];
  return (
    <Tag {...rest} className={cx(styles[variant], tone !== 'default' && styles[tone], measure && styles.measure, className)}>
      {children}
    </Tag>
  );
}
