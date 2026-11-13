import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '@rnine/core/kit';
import { useReducedMotion } from '@rnine/core/motion';
import { spawn } from '../../fx/overlay';
import { easeInOut, readRoles } from '../../fx/paint';
import { useNight } from '../../fx/useNight';
import { TRAIL_D, TRAIL_H, TRAIL_LENGTH, TRAIL_W, pointAt, stopLengths, walkedD } from './trailPath';
import styles from './LanternTrail.module.scss';

export type TrailStop = {
  id: string;
  label: string;
};

export type LanternTrailProps = {
  /** The stops along the trail, left to right (four fit best; two to six work). */
  stops: TrailStop[];
  /** The stop that's open (controlled). Without it, the trail keeps its own. */
  value?: string | null;
  /** Called when the lantern arrives at the stop the viewer picked: open its page then. */
  onChange?: (id: string) => void;
  /** Names the trail for screen readers, e.g. "Shop sections". */
  label: string;
  /** The id of the panel the stops open (aria-controls). */
  controls?: string;
  /** Walking speed: 1 is the base pace (default 1.2, tuned). */
  speed?: number;
  className?: string;
};

/** Fireflies (night) or motes (day) the lantern leaves behind: the chance per frame (tuned). */
const TRAIL_MOTES = 0.2;

/**
 * Navigation as a lantern trail: stops along a winding path, and a lantern
 * that walks to the one you pick, lighting the path behind it (a few
 * fireflies follow it at night). The stop's page opens when the lantern
 * arrives (onChange). A tab list: arrow keys, Home and End move between
 * stops. With reduced motion the lantern is simply there.
 */
export function LanternTrail({ stops, value, onChange, label, controls, speed = 1.2, className }: LanternTrailProps) {
  const reduced = useReducedMotion();
  const lengths = stopLengths(stops.length);
  const [own, setOwn] = useState<string | null>(null);
  const selected = value !== undefined ? value : own;
  const selectedIndex = stops.findIndex((s) => s.id === selected);
  const [pos, setPos] = useState(() => lengths[Math.max(0, selectedIndex)] ?? 0);
  const posRef = useRef(pos);
  const walk = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const lanternRef = useRef<HTMLSpanElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const night = useNight(rootRef);

  // A selection made outside (value) moves the lantern without a walk
  useEffect(() => {
    if (selectedIndex < 0 || walk.current) return;
    posRef.current = lengths[selectedIndex];
    setPos(lengths[selectedIndex]);
    // lengths follows stops.length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, stops.length]);

  useEffect(() => () => cancelAnimationFrame(walk.current), []);

  const walkTo = (i: number) => {
    const stop = stops[i];
    if (!stop) return;
    if (value === undefined) setOwn(stop.id);
    cancelAnimationFrame(walk.current);
    const from = posRef.current;
    const to = lengths[i];
    const dur = reduced ? 0 : (450 + (Math.abs(to - from) / TRAIL_LENGTH) * 1000) / speed;
    let t0 = 0;
    const step = (t: number) => {
      t0 ||= t;
      const q = dur ? Math.min(1, (t - t0) / dur) : 1;
      const p = from + (to - from) * easeInOut(q);
      posRef.current = p;
      setPos(p);
      if (!reduced && q < 1 && Math.random() < TRAIL_MOTES && lanternRef.current) leaveMote(lanternRef.current);
      if (q < 1) walk.current = requestAnimationFrame(step);
      else {
        walk.current = 0;
        onChange?.(stop.id);
      }
    };
    walk.current = requestAnimationFrame(step);
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    const n = stops.length;
    const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (i + 1) % n : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    buttons.current[next]?.focus();
    walkTo(next);
  };

  const [lx, ly] = pointAt(pos);
  const focusable = selectedIndex >= 0 ? selectedIndex : 0;

  return (
    <div ref={rootRef} className={cx(styles.trail, night && styles.night, className)} role="tablist" aria-label={label}>
      <svg className={styles.path} viewBox={`0 0 ${TRAIL_W} ${TRAIL_H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path className={styles.base} d={TRAIL_D} />
        <path className={styles.walked} d={walkedD(pos)} />
      </svg>
      {stops.map((stop, i) => {
        const [x, y] = pointAt(lengths[i]);
        return (
          <button
            key={stop.id}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={stop.id === selected}
            aria-controls={controls}
            tabIndex={i === focusable ? 0 : -1}
            className={cx(styles.stop, i % 2 === 1 && styles.up)}
            style={{ left: `${(x / TRAIL_W) * 100}%`, top: `${(y / TRAIL_H) * 100}%` }}
            onClick={() => walkTo(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <i aria-hidden="true" />
            <span>{stop.label}</span>
          </button>
        );
      })}
      <span ref={lanternRef} className={styles.lantern} style={{ left: `${(lx / TRAIL_W) * 100}%`, top: `${(ly / TRAIL_H) * 100}%` }} aria-hidden="true">
        <svg viewBox="0 0 30 40" focusable="false">
          <circle className={styles.halo} cx="15" cy="24" r="15" />
          <path className={styles.frame} d="M15 1v5M9 9h12l2 4v18l-2 4H9l-2-4V13z" />
          <path className={styles.frame} d="M7 13h16M7 31h16" />
          <ellipse className={styles.glass} cx="15" cy="22" rx="4" ry="6" />
        </svg>
      </span>
    </div>
  );
}

/** A firefly (night) or a mote of light (day) rising from the lantern. */
function leaveMote(lantern: HTMLElement) {
  const r = lantern.getBoundingClientRect();
  const roles = readRoles(lantern);
  const x = r.left + r.width / 2 + window.scrollX;
  const y = r.top + r.height * 0.6 + window.scrollY;
  spawn([
    roles.night
      ? { kind: 'fly', x, y, vx: (Math.random() - 0.5) * 1.2, vy: -0.2 - Math.random() * 0.8, life: 0, max: 900, phase: Math.random() * 600, size: 0.5, drag: 0.97, roles }
      : { kind: 'dust', x, y, vx: (Math.random() - 0.5) * 0.8, vy: -0.3 - Math.random() * 0.6, life: 0, max: 800, size: 0.8 + Math.random(), roles },
  ]);
}
