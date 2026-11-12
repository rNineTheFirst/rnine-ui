import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';
import { useTheme } from '../../provider/ThemeProvider';
import { Reveal } from '../../motion/Reveal';
import { cx } from '../../utils/cx';
import styles from './Layout.module.scss';

type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  /** text: a 65-character column for reading. Default: the 1120px page column. */
  width?: 'page' | 'text' | 'wide';
  children: ReactNode;
};

/** Centered column with the gutter (16px or the phone's safe area). */
export function Container({ as: Tag = 'div', width = 'page', className, children, ...rest }: ContainerProps) {
  return (
    <Tag {...rest} className={cx(styles.container, styles[width], className)}>
      {children}
    </Tag>
  );
}

type StackProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  /** row or column (default). */
  direction?: 'row' | 'column';
  /** Gap from the 4px space scale (4 = 16px). */
  gap?: Space;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  /** Let a row wrap onto new lines. */
  wrap?: boolean;
  children: ReactNode;
};

/** Spaces its children with a gap from the scale. Siblings are never spaced with margins. */
export function Stack({ as: Tag = 'div', direction = 'column', gap = 4, align, justify, wrap, className, style, children, ...rest }: StackProps) {
  return (
    <Tag
      {...rest}
      className={cx(styles.stack, className)}
      style={{
        flexDirection: direction,
        gap: `var(--r9-space-${gap})`,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : undefined,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

type EyebrowProps = { number?: string; children: ReactNode; className?: string };

/** Small uppercase label above a heading. The number sits in an accent block. */
export function Eyebrow({ number, children, className }: EyebrowProps) {
  return (
    <span className={cx(styles.eyebrow, className)}>
      {number ? <span className={styles.num}>{number}</span> : <span className={styles.mark} aria-hidden="true" />}
      {children}
    </span>
  );
}

type SectionProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  /** Anchor id; also used to label the section. */
  id: string;
  eyebrow?: ReactNode;
  /** Section number shown in the eyebrow, e.g. "02". */
  number?: string;
  /** Heading text. Decodes from glyphs when scrolled into view. */
  title: string;
  lede?: ReactNode;
  /** Heading level (default 2). */
  level?: 2 | 3;
  children?: ReactNode;
};

/**
 * A page section: eyebrow, revealing heading (the library's TextReveal), lede, content, inside the
 * page column. Accent element: the eyebrow's number block (or mark).
 */
export function Section({ id, eyebrow, number, title, lede, level = 2, className, children, ...rest }: SectionProps) {
  const { TextReveal } = useTheme().slots;
  return (
    <section {...rest} id={id} aria-labelledby={`${id}-title`} className={cx(styles.section, className)}>
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          {eyebrow && <Eyebrow number={number}>{eyebrow}</Eyebrow>}
          <TextReveal as={`h${level}`} id={`${id}-title`} className={styles[`title${level}`]} text={title} trigger="view" />
          {lede && <p className={styles.lede}>{lede}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
