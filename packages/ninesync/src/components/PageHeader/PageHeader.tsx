import type { ComponentProps } from 'react';
import { PageHeader as CorePageHeader } from '@rnine/core';
import { TextReveal } from '../../motion/TextReveal';

/**
 * The top of an app page: breadcrumbs, the title (the page's h1) with its
 * status, a description and the page's actions. In NineSync a text title
 * rises in and its pale mark draws under the last word.
 */
export function PageHeader({ title, ...props }: ComponentProps<typeof CorePageHeader>) {
  return <CorePageHeader {...props} title={typeof title === 'string' ? <TextReveal text={title} trigger="mount" /> : title} />;
}
