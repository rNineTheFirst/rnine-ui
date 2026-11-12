import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '../../utils/cx';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

type Common = {
  /**
   * primary: accent fill, the one main action.
   * secondary: terminal prompt with a accent ">".
   * outline: hairline that turns accent on hover.
   * ghost: text that gets a accent underline on hover.
   */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon before the label (e.g. a lucide-react icon at size 18) */
  iconStart?: ReactNode;
  /** Icon after the label; slides right on hover */
  iconEnd?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
};

export type ButtonAsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined; ref?: Ref<HTMLButtonElement> };
export type ButtonAsLink = Common &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    ref?: Ref<HTMLAnchorElement>;
    /** Leaves the site in a new tab ("Visit site"): adds ↗, rel="noopener" and screen-reader text. */
    external?: boolean;
  };
export type ButtonProps = ButtonAsButton | ButtonAsLink;

/** Buttons and button-styled links. Pass `href` to render a link. */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', iconStart, iconEnd, fullWidth, className, children, ref, ...rest } = props;
  const classes = cx(styles.button, styles[variant], styles[size], fullWidth && styles.full, className);
  const content = (
    <>
      {iconStart && <span className={styles.icon}>{iconStart}</span>}
      {children != null && <span className={styles.label}>{children}</span>}
      {iconEnd && <span className={cx(styles.icon, styles.end)}>{iconEnd}</span>}
    </>
  );

  if (typeof (rest as ButtonAsLink).href === 'string') {
    const { external, ...linkRest } = rest as ButtonAsLink;
    if (external) {
      return (
        <a {...linkRest} target="_blank" rel="noopener noreferrer" ref={ref as Ref<HTMLAnchorElement>} className={classes}>
          {iconStart && <span className={styles.icon}>{iconStart}</span>}
          {children != null && <span className={styles.label}>{children}</span>}
          <span className={cx(styles.icon, styles.end)} aria-hidden="true">{iconEnd ?? '↗'}</span>
          <span className={styles.sr}> (opens in a new tab)</span>
        </a>
      );
    }
    return (
      <a {...(linkRest as AnchorHTMLAttributes<HTMLAnchorElement>)} ref={ref as Ref<HTMLAnchorElement>} className={classes}>
        {content}
      </a>
    );
  }
  const { type = 'button', ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button {...buttonRest} ref={ref as Ref<HTMLButtonElement>} type={type} className={classes}>
      {content}
    </button>
  );
}
