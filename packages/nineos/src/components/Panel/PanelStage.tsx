import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '@rnine/core/motion';
import { SWAP_OUT_MS, swapIn, swapOut } from '../../motion/signal';
import { cx } from '@rnine/core/kit';
import { PanelStageContext } from '@rnine/core/kit';
import styles from './PanelStage.module.scss';

type Props = {
  /** Identifies the panel to show (e.g. the command that opened it). null shows an empty stage. */
  panelKey: string | null;
  /** The panel for panelKey (usually a <Panel>). Ignored while panelKey is null. */
  children?: ReactNode;
  className?: string;
};

type Slot = HTMLDivElement & { inert: boolean };

/**
 * Shows one panel at a time and switches with the NineOS "signal swap": the
 * old panel signals out (RGB split, 220ms), then the new one is revealed
 * top-down behind a magenta scan line. panelKey null closes to an empty stage.
 *
 * A panel on its way out always hands over to the newest panelKey, so fast
 * switching ends on the last command and closing mid-swap ends empty.
 * Nothing is left on the panels afterwards; with reduced motion, swaps are instant.
 */
export function PanelStage({ panelKey, children, className }: Props) {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const slot = useRef<Slot | null>(null);
  const detached = useRef<Slot | null>(null);
  const leaving = useRef<Slot | null>(null);
  const mounted = useRef(false);

  // The current panel's wrapper; when it unmounts, keep the element to animate it out
  const setSlot = useCallback((el: HTMLDivElement | null) => {
    if (el) slot.current = el as Slot;
    else {
      detached.current = slot.current;
      slot.current = null;
    }
  }, []);

  // Panels entering after an exit wait for it before their own effects start
  const [prevKey, setPrevKey] = useState(panelKey);
  const [enterDelay, setEnterDelay] = useState(0);
  if (prevKey !== panelKey) {
    setPrevKey(panelKey);
    setEnterDelay(prevKey !== null && !reduced ? SWAP_OUT_MS + 120 : 120);
  }

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const ghost = ghostRef.current;
    const next = slot.current;
    const old = detached.current;
    detached.current = null;

    // First render: no transition, the panel is simply there
    if (!mounted.current) {
      mounted.current = true;
      if (next) next.dataset.shown = 'true';
      return;
    }
    if (!stage || !ghost) return;

    const reveal = () => {
      const current = slot.current;
      stage.style.minHeight = '';
      if (!current) return;
      current.style.visibility = '';
      current.dataset.shown = 'true';
      if (!reduced) swapIn(current, barRef.current);
    };

    if (reduced) {
      ghost.replaceChildren();
      leaving.current = null;
      reveal();
      return;
    }

    // A panel is already leaving: the newest one waits for it (hidden)
    if (leaving.current) {
      if (next) next.style.visibility = 'hidden';
      return;
    }

    // The panel that was showing leaves first, then the new one enters
    if (old && old.dataset.shown === 'true') {
      ghost.appendChild(old);
      old.inert = true;
      leaving.current = old;
      stage.style.minHeight = `${old.offsetHeight}px`;
      if (next) next.style.visibility = 'hidden';
      void swapOut(old).then(() => {
        old.remove();
        if (leaving.current === old) leaving.current = null;
        reveal();
      });
      return;
    }

    reveal();
  }, [panelKey, reduced]);

  return (
    <PanelStageContext.Provider value={{ enterDelay }}>
      <div ref={stageRef} className={cx(styles.stage, className)} aria-live="polite">
        <div ref={ghostRef} className={styles.ghost} aria-hidden="true" />
        <div ref={barRef} className={styles.scanbar} aria-hidden="true" />
        {panelKey !== null && (
          <div key={panelKey} ref={setSlot} className={styles.slot}>
            {children}
          </div>
        )}
      </div>
    </PanelStageContext.Provider>
  );
}
