import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/motion';
import { cx } from '../../utils/cx';
import { Lightbox } from './Lightbox';
import styles from './ScreenshotCarousel.module.scss';

export type Screenshot = {
  src: string;
  /** What the screenshot shows, for screen readers. */
  alt: string;
  /** Short visible label under it, e.g. "Post editor". */
  caption?: string;
  /** A video to play full screen instead (src is then its cover frame). Used by MediaGallery. */
  video?: string;
};

type Props = {
  shots: Screenshot[];
  /** Accessible name of the carousel, e.g. "Screenshots of harbor". */
  label: string;
  /** Width / height of the frame. Default 16 / 9. */
  aspectRatio?: string;
  className?: string;
};

/**
 * Screenshots of a project, one at a time: swipe, use the arrows or the dots,
 * and tap a shot to open it full screen (zoom with a click or pinch, pan by
 * dragging). Works the same on every screen size. Accent element: the
 * current dot.
 */
export function ScreenshotCarousel({ shots, label, aspectRatio = '16 / 9', className }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const last = shots.length - 1;

  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(last, i));
      setIndex(next);
      const el = track.current;
      el?.scrollTo?.({ left: next * el.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
    },
    [last, reduced],
  );

  // Swiping scrolls the track: follow it
  const onScroll = () => {
    const el = track.current;
    if (el && el.clientWidth) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  // A wider or narrower panel must not land between two shots
  const indexRef = useRef(index);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      el.scrollLeft = indexRef.current * el.clientWidth;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!shots.length) return null;

  return (
    <div className={cx(styles.carousel, className)} style={{ ['--ratio' as string]: aspectRatio }}>
      <div
        ref={track}
        className={styles.track}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onScroll={onScroll}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
        }}
      >
        {shots.map((shot, i) => (
          <figure
            key={shot.src + i}
            className={styles.slide}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${shots.length}`}
          >
            <button
              type="button"
              className={styles.zoom}
              onClick={() => setZoomed(i)}
              aria-label={`Zoom in: ${shot.caption ?? shot.alt}`}
              tabIndex={i === index ? 0 : -1}
            >
              <img src={shot.src} alt={shot.alt} loading={i === 0 ? 'eager' : 'lazy'} draggable={false} />
            </button>
            {shot.caption && <figcaption>{shot.caption}</figcaption>}
          </figure>
        ))}
      </div>

      {shots.length > 1 && (
        <div className={styles.nav}>
          <button type="button" className={styles.step} onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous screenshot">
            ‹
          </button>
          <div className={styles.dots}>
            {shots.map((shot, i) => (
              <button
                key={shot.src + i}
                type="button"
                className={styles.dot}
                onClick={() => go(i)}
                aria-label={`Screenshot ${i + 1}${shot.caption ? `: ${shot.caption}` : ''}`}
                aria-current={i === index}
              />
            ))}
          </div>
          <button type="button" className={styles.step} onClick={() => go(index + 1)} disabled={index === last} aria-label="Next screenshot">
            ›
          </button>
          <span className={styles.count} aria-live="polite">
            {index + 1} / {shots.length}
          </span>
        </div>
      )}

      <Lightbox
        shots={shots}
        index={zoomed}
        onIndexChange={(i) => {
          setZoomed(i);
          go(i);
        }}
        onClose={() => setZoomed(null)}
      />
    </div>
  );
}
