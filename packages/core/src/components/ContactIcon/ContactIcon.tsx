import { Globe, Mail, Phone } from 'lucide-react';
import { contactKind } from '../../utils/contact';
import { cx } from '../../utils/cx';
import styles from './ContactIcon.module.scss';

type Props = {
  /** The contact's link: mailto: (email), tel: (phone), or a web address (a known site's mark, else a globe). */
  href: string | null | undefined;
  /** Pixels. Default 20. */
  size?: number;
  className?: string;
};

/**
 * The icon for a contact line: mail, phone, a known site's mark (GitHub,
 * LinkedIn, X, YouTube, Dribbble... from Simple Icons, CC0; LinkedIn drawn
 * in Lucide's line style), or a globe for any other site. Decorative: the
 * line's text says what it is. Takes the surrounding text color.
 * Accent element: none of its own (it sits inside a component that has one).
 */
export function ContactIcon({ href, size = 20, className }: Props) {
  const kind = contactKind(href);
  const common = { size, strokeWidth: 1.5, absoluteStrokeWidth: true, 'aria-hidden': true as const, className: cx(styles.icon, className) };
  if (kind.type === 'email') return <Mail {...common} />;
  if (kind.type === 'phone') return <Phone {...common} />;
  const brand = kind.brand;
  if (!brand) return <Globe {...common} />;
  if (brand.icon === 'linkedin') {
    // LinkedIn isn't in Simple Icons: its "in", drawn like a Lucide icon
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cx(styles.icon, className)}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 11v5" />
        <path d="M12 16v-5" />
        <path d="M12 13.5a2.5 2.5 0 0 1 5 0V16" />
        <circle cx="8" cy="8" r="0.6" fill="currentColor" />
      </svg>
    );
  }
  // Brand marks are filled shapes; drawn a touch smaller so they sit level with the line icons
  return (
    <svg width={size} height={size} viewBox="-2 -2 28 28" fill="currentColor" aria-hidden="true" className={cx(styles.icon, className)}>
      <path d={brand.icon.path} />
    </svg>
  );
}
