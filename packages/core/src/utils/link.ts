import type { AnchorHTMLAttributes, ReactNode } from 'react';

/** The props of a link a component draws: spread them on your router's link. */
export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/**
 * Draws a component's links with your router instead of plain <a>:
 * renderLink={({ href, ...props }) => <Link to={href} {...props} />}
 */
export type RenderLink = (props: LinkProps) => ReactNode;
