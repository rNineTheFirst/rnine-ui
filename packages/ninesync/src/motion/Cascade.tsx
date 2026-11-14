import type { ElementType, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** The element to render. Default div. */
  as?: ElementType;
  className?: string;
};

/**
 * A screen's content, entering as a cascade: its children rise 8px and fade
 * in, 40ms apart, and table rows inside fade in 18ms apart. Played by
 * ThemeProvider's page effects (any element with data-cascade works the same).
 */
export function Cascade({ children, as: Tag = 'div', className }: Props) {
  return (
    <Tag className={className} data-cascade="">
      {children}
    </Tag>
  );
}
