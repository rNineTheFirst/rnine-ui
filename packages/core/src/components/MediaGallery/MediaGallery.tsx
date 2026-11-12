import { useState } from 'react';
import { useFinePointer, useReducedMotion } from '../../hooks/motion';
import { clock } from '../../utils/clock';
import { cx } from '../../utils/cx';
import { Lightbox } from '../ScreenshotCarousel/Lightbox';
import styles from './MediaGallery.module.scss';

export type MediaPiece = {
  id: string;
  kind: 'photo' | 'video';
  /** The grid's picture: a photo's thumbnail, a video's cover frame. */
  thumb: string;
  /** What opens full screen: a photo's display copy, or the video. */
  full: string;
  /** What it shows, for screen readers. */
  alt: string;
  title: string;
  width: number;
  height: number;
  /** Video: seconds, shown on the tile. */
  duration?: number | null;
};

type Props = {
  items: MediaPiece[];
  /** Accessible name of the gallery, e.g. "Photos". */
  label: string;
  className?: string;
};

/**
 * Graphic design pieces in a grid that keeps each one's shape (columns, like
 * a contact sheet). A tile opens the piece full screen: photos zoom, videos
 * play with sound and controls; arrows step through the rest. Video tiles
 * show their length and, with a mouse, play muted on hover (not under
 * reduced motion). Accent element: the play mark on video tiles, and the
 * focus ring.
 */
export function MediaGallery({ items, label, className }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const preview = fine && !reduced;

  return (
    <>
      <ul className={cx(styles.grid, className)} aria-label={label}>
        {items.map((m, i) => (
          <li key={m.id} className={styles.item}>
            <button
              type="button"
              className={styles.tile}
              onClick={() => setOpen(i)}
              onPointerEnter={() => preview && m.kind === 'video' && setHovered(m.id)}
              onPointerLeave={() => setHovered((h) => (h === m.id ? null : h))}
              aria-label={`${m.title}${m.kind === 'video' ? `, video${m.duration ? ` ${clock(m.duration)}` : ''}` : ''}: open`}
            >
              <span className={styles.frame} style={{ aspectRatio: `${m.width} / ${m.height}` }}>
                <img src={m.thumb} alt={m.alt} loading="lazy" decoding="async" width={m.width} height={m.height} />
                {hovered === m.id && <video className={styles.preview} src={m.full} muted autoPlay loop playsInline aria-hidden="true" />}
                {m.kind === 'video' && (
                  <span className={styles.badge} aria-hidden="true">
                    <span className={styles.play} />
                    {m.duration ? clock(m.duration) : 'video'}
                  </span>
                )}
              </span>
              <span className={styles.title}>{m.title}</span>
            </button>
          </li>
        ))}
      </ul>
      <Lightbox
        shots={items.map((m) => ({ src: m.kind === 'video' ? m.thumb : m.full, alt: m.alt, caption: m.title, video: m.kind === 'video' ? m.full : undefined }))}
        index={open}
        onIndexChange={setOpen}
        onClose={() => setOpen(null)}
        noun="Piece"
      />
    </>
  );
}
