import { useEffect, useState } from 'react';
import { cx } from '@rnine/core/kit';
import { moonPath, moonPhase } from './moon';
import styles from './MoonDial.module.scss';

export type MoonDialProps = {
  /** Show this moment instead of now (the dial then stays still). */
  date?: Date;
  /** Locale for the time, e.g. "en-GB". Default: the browser's. */
  locale?: string;
  className?: string;
};

const STARS: [number, number][] = [[30, 40], [58, 18], [152, 26], [186, 52], [96, 34], [128, 58], [70, 70]];

/**
 * A sun and moon dial: the sun crosses the arc by day, the moon by night, in
 * its real phase for today, with the phase's name and how much of it is lit.
 * Updates every minute.
 */
export function MoonDial({ date, locale, className }: MoonDialProps) {
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    if (date) return;
    const tick = window.setInterval(() => setClock(new Date()), 60000);
    return () => window.clearInterval(tick);
  }, [date]);
  const now = date ?? clock;

  const moon = moonPhase(now);
  const hours = now.getHours() + now.getMinutes() / 60;
  const day = hours >= 6 && hours < 18;
  const along = day ? (hours - 6) / 12 : ((hours + 6) % 24) / 12;
  const angle = Math.PI - along * Math.PI;
  const x = +(110 + Math.cos(angle) * 88).toFixed(1);
  const y = +(118 - Math.sin(angle) * 88).toFixed(1);
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  const summary = `${moon.name}, ${Math.round(moon.lit * 100)}% lit; ${day ? 'the sun is up' : 'the moon is out'} at ${time}`;

  return (
    <figure className={cx(styles.dial, !day && styles.night, className)}>
      <svg className={styles.art} viewBox="0 0 220 140" role="img" aria-label={summary}>
        <path className={styles.arc} d="M22 118A88 88 0 0 1 198 118" />
        <path className={styles.ground} d="M8 118H212" />
        {Array.from({ length: 7 }, (_, i) => {
          const a = Math.PI - (i / 6) * Math.PI;
          return <line key={i} className={styles.tick} x1={(110 + Math.cos(a) * 82).toFixed(1)} y1={(118 - Math.sin(a) * 82).toFixed(1)} x2={(110 + Math.cos(a) * 88).toFixed(1)} y2={(118 - Math.sin(a) * 88).toFixed(1)} />;
        })}
        {!day && STARS.map(([sx, sy], n) => <circle key={n} className={styles.star} cx={sx} cy={sy} r={n % 3 ? 0.9 : 1.4} />)}
        {day ? (
          <>
            <circle className={styles.sun} cx={x} cy={y} r="9" />
            {Array.from({ length: 8 }, (_, j) => {
              const b = (j / 8) * Math.PI * 2;
              return <line key={j} className={styles.ray} x1={(x + Math.cos(b) * 13).toFixed(1)} y1={(y + Math.sin(b) * 13).toFixed(1)} x2={(x + Math.cos(b) * 17).toFixed(1)} y2={(y + Math.sin(b) * 17).toFixed(1)} />;
            })}
            {/* Today's moon, waiting in the corner */}
            <circle className={styles.dark} cx="196" cy="24" r="10" />
            <path className={styles.lit} d={moonPath(196, 24, 10, moon.phase)} />
          </>
        ) : (
          <>
            <circle className={styles.dark} cx={x} cy={y} r="13" />
            <path className={styles.lit} d={moonPath(x, y, 13, moon.phase)} />
          </>
        )}
        <text className={styles.label} x="14" y="134">{day ? '6:00' : '18:00'}</text>
        <text className={styles.label} x="176" y="134">{day ? '18:00' : '6:00'}</text>
      </svg>
      <figcaption className={styles.caption}>
        <span className={styles.words}>{moon.name}</span>
        <span className={styles.sub}>
          {Math.round(moon.lit * 100)}% lit · {day ? 'the sun is up' : 'the moon is out'} · {time}
        </span>
      </figcaption>
    </figure>
  );
}
