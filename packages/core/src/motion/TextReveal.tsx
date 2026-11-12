import type { ElementType } from 'react';

export type TextRevealProps = {
  text: string;
  as?: ElementType;
  className?: string;
  id?: string;
  /** mount: on first render. view: when scrolled into view. hover: on pointer enter. */
  trigger?: 'mount' | 'view' | 'hover';
  /** Total time in ms. Default 1000. */
  duration?: number;
  delay?: number;
};

/**
 * Text that reveals itself: the library's title effect (NineOS decodes it
 * from terminal symbols). Plain shows the text as it is. Screen readers always
 * get the final text.
 */
export function TextReveal({ text, as: Tag = 'span', className, id }: TextRevealProps) {
  return (
    <Tag id={id} className={className}>
      {text}
    </Tag>
  );
}
