import { useState } from 'react';
import { cx } from '../../utils/cx';
import styles from './Avatar.module.scss';

type Props = {
  /** Person's name: the image's alt text and the source of the initials. */
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : parts[0][1] ?? '';
  return `${first}${last}`.toUpperCase();
}

/**
 * A person's picture, or their initials when there is none (or it fails to
 * load). Round, whatever the library's corners. Accent element: the
 * initials tile, or the ring around a photo.
 */
export function Avatar({ name, src, size = 'md', className }: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  return (
    <span className={cx(styles.avatar, styles[size], showImage ? styles.photo : styles.initials, className)}>
      {showImage ? (
        <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span role="img" aria-label={name}>{initials(name)}</span>
      )}
    </span>
  );
}
