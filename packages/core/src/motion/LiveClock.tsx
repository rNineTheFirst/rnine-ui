import { useEffect, useState } from 'react';
import styles from './LiveClock.module.scss';

const pad = (n: number) => String(n).padStart(2, '0');

/** "SYS 17:04:33" with a pulsing status dot: the page is alive. */
export function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className={styles.sys}>
      <span className={styles.pulse} aria-hidden="true" />
      <time dateTime={now.toISOString()}>
        SYS {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
      </time>
    </span>
  );
}
