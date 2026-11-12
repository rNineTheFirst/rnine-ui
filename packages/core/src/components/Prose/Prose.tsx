import { useMemo, type HTMLAttributes } from 'react';
import DOMPurify from 'dompurify';
import { cx } from '../../utils/cx';
import styles from './Prose.module.scss';

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'dangerouslySetInnerHTML'> & {
  /** The article's HTML (e.g. from the post editor). Sanitized before it renders. */
  html: string;
};

/**
 * Long-form reading: a blog post's body set in the library's type, at a readable
 * measure. Headings, lists, quotes, code, images and links are styled; the
 * HTML is sanitized (scripts, event handlers and the like are removed).
 * Accent element: the links (and the quote rule).
 */
export function Prose({ html, className, ...rest }: Props) {
  const clean = useMemo(() => DOMPurify.sanitize(html), [html]);
  return <div {...rest} className={cx(styles.prose, className)} dangerouslySetInnerHTML={{ __html: clean }} />;
}
