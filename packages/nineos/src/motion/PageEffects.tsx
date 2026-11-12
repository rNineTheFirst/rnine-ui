import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@rnine/core/motion';
import styles from './PageEffects.module.scss';

type Burst = { x: number; y: number; t: number };

/** Page-wide effects: drifting scanlines (Cipher) and magenta click sparks. Mount once. */
export function PageEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || reduced) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let bursts: Burst[] = [];
    let raf = 0;
    let color = '';

    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      bursts = bursts.filter((b) => now - b.t < 420);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      for (const b of bursts) {
        const p = (now - b.t) / 420;
        const eased = 1 - (1 - p) ** 3;
        const r1 = 6 + eased * 16;
        const r2 = r1 + 8 * (1 - p);
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI * 2 * i) / 8;
          ctx.beginPath();
          ctx.moveTo(b.x + Math.cos(a) * r1, b.y + Math.sin(a) * r1);
          ctx.lineTo(b.x + Math.cos(a) * r2, b.y + Math.sin(a) * r2);
          ctx.stroke();
        }
      }
      raf = bursts.length ? requestAnimationFrame(draw) : 0;
    };
    const onClick = (e: MouseEvent) => {
      color = getComputedStyle(document.documentElement).getPropertyValue('--r9-accent').trim();
      bursts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (!raf) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('click', onClick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('click', onClick);
    };
  }, [reduced]);

  return (
    <>
      <div className={styles.scan} aria-hidden="true" />
      <canvas ref={canvasRef} className={styles.sparks} aria-hidden="true" />
    </>
  );
}
