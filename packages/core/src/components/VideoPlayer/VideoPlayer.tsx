import { useEffect, useRef, type Ref } from 'react';
import { useReducedMotion } from '../../hooks/motion';
import { cx } from '../../utils/cx';
import styles from './VideoPlayer.module.scss';

type Props = {
  src: string;
  /** The cover frame, shown until it plays. */
  poster?: string | null;
  /** What the video is, for screen readers, e.g. "Showreel 2026". */
  label: string;
  /** Width / height of the frame. Default 16 / 9. */
  aspectRatio?: string;
  /**
   * A showreel: starts by itself, muted and looping, as soon as it's on
   * screen. Under reduced motion it waits for play instead.
   */
  ambient?: boolean;
  className?: string;
  ref?: Ref<HTMLElement>;
};

/**
 * A video in the library's frame (its corner, a hairline), with the browser's own
 * controls: play, sound, full screen. Plays inline on phones. Accent
 * element: the lit corner.
 */
export function VideoPlayer({ src, poster, label, aspectRatio = '16 / 9', ambient = false, className, ref }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const auto = ambient && !reduced;

  // Autoplay needs the muted property set before play() (the attribute alone isn't enough in React)
  useEffect(() => {
    const el = video.current;
    if (!el || !auto) return;
    el.muted = true;
    try {
      void el.play?.()?.catch?.(() => undefined);
    } catch {
      // No playback here (tests, a browser that refuses): the poster and controls stay
    }
  }, [auto, src]);

  return (
    <figure ref={ref} className={cx(styles.player, className)} style={{ aspectRatio }}>
      <video
        ref={video}
        className={styles.video}
        src={src}
        poster={poster ?? undefined}
        aria-label={label}
        controls
        playsInline
        loop={ambient}
        preload={auto ? 'auto' : 'metadata'}
      />
    </figure>
  );
}
