import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { Screenshot } from './ScreenshotCarousel';
import styles from './ScreenshotCarousel.module.scss';

type Props = {
  shots: Screenshot[];
  /** The open shot, or null when closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** What one item is called, for screen readers: "Screenshot" (default), "Piece"... */
  noun?: string;
};

const ZOOM = 2;

/**
 * Full-screen view of one screenshot (native <dialog>: focus stays inside and
 * returns on close). Zoom: the button, + / =, or a click on the image (zooms
 * at that point); with a mouse, drag to pan. On touch, pinch and scroll.
 * Escape closes only the zoom, never the panel behind it. An item with a
 * video plays it (with sound and controls) instead of zooming.
 */
export function Lightbox({ shots, index, onIndexChange, onClose, noun = 'Screenshot' }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  // Zoom belongs to one shot: stepping to another opens it fitted
  const [zoomedShot, setZoomedShot] = useState<number | null>(null);
  const zoom = zoomedShot !== null && zoomedShot === index;
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  const open = index !== null;
  const shot = open ? shots[index] : null;
  const video = shot?.video;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const toggleZoom = (x?: number, y?: number) => {
    const el = img.current;
    const box = stage.current;
    if (!el || !box) return;
    if (zoom) {
      el.style.width = '';
      setZoomedShot(null);
      return;
    }
    // Keep the point under the cursor (or the middle) in view after zooming
    const r = el.getBoundingClientRect();
    const fx = x === undefined || !r.width ? 0.5 : (x - r.left) / r.width;
    const fy = y === undefined || !r.height ? 0.5 : (y - r.top) / r.height;
    el.style.width = `${r.width * ZOOM}px`;
    setZoomedShot(index);
    requestAnimationFrame(() => {
      box.scrollLeft = fx * el.offsetWidth - box.clientWidth / 2;
      box.scrollTop = fy * el.offsetHeight - box.clientHeight / 2;
    });
  };

  const step = (d: number) => {
    if (index === null) return;
    onIndexChange((index + d + shots.length) % shots.length);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'Escape') e.stopPropagation(); // the dialog closes; the panel behind stays
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
    if ((e.key === '+' || e.key === '=') && !video) toggleZoom();
  };

  // Mouse: drag pans a zoomed image; a click without dragging toggles zoom there
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !stage.current) return;
    drag.current = { x: e.clientX, y: e.clientY, left: stage.current.scrollLeft, top: stage.current.scrollTop, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !zoom || !stage.current) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    stage.current.scrollLeft = d.left - dx;
    stage.current.scrollTop = d.top - dy;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved && e.target === img.current) toggleZoom(e.clientX, e.clientY);
  };

  return (
    <dialog
      ref={dialog}
      className={styles.lightbox}
      aria-label={shot ? `${noun}: ${shot.caption ?? shot.alt}` : noun}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={onKeyDown}
    >
      {shot && (
        <>
          <div className={styles.bar}>
            <span className={styles.caption}>
              <b>{shot.caption ?? shot.alt}</b> · {index! + 1} / {shots.length}
            </span>
            <span className={styles.barActions}>
              {shots.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label={`Previous ${noun.toLowerCase()}`}>‹</button>
                  <button type="button" onClick={() => step(1)} aria-label={`Next ${noun.toLowerCase()}`}>›</button>
                </>
              )}
              {!video && (
                <button type="button" onClick={() => toggleZoom()} aria-pressed={zoom}>
                  {zoom ? 'Fit' : 'Zoom in'}
                </button>
              )}
              <button type="button" className={styles.close} onClick={onClose}>
                × close
              </button>
            </span>
          </div>
          {video ? (
            <div className={`${styles.stage} ${styles.playing}`}>
              {/* keyed: the next item starts its own video */}
              <video key={index} src={video} poster={shot.src} aria-label={shot.alt} controls autoPlay playsInline />
            </div>
          ) : (
            <div
              ref={stage}
              className={zoom ? `${styles.stage} ${styles.zoomed}` : styles.stage}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {/* keyed: a new shot starts with no zoom width */}
              <img key={index} ref={img} src={shot.src} alt={shot.alt} draggable={false} />
            </div>
          )}
        </>
      )}
    </dialog>
  );
}
