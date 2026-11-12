import { cx } from '../../utils/cx';
import styles from './PanelBar.module.scss';

type Props = {
  /** The command that opened the panel, shown after the prompt. Leave out in Menu mode. */
  command?: string;
  prompt?: string;
  /** Shows "↩ back" when there is somewhere to go back to. */
  onBack?: () => void;
  /** Shows "× close" (closing returns to an empty stage). */
  onClose?: () => void;
  /**
   * Shows "⤢ maximize" / "⤡ restore" (wide screens only). Leave out for a panel
   * locked to one size. The app widens its stage to max(normal, 75% of the
   * screen) while maximized.
   */
  onToggleMaximize?: () => void;
  /** Whether the panel is maximized right now. */
  maximized?: boolean;
  className?: string;
};

/**
 * The line above a panel: what opened it, and how to leave it. Accent
 * element: the prompt.
 */
export function PanelBar({ command, prompt = '>', onBack, onClose, onToggleMaximize, maximized = false, className }: Props) {
  return (
    <div className={cx(styles.bar, className)}>
      {command && (
        <>
          <span className={styles.prompt}>{prompt}</span>
          <span className={styles.command}>{command}</span>
        </>
      )}
      <span className={styles.controls}>
        {onToggleMaximize && (
          <button
            type="button"
            className={`${styles.control} ${styles.maximize}`}
            onClick={onToggleMaximize}
            aria-pressed={maximized}
            aria-label={maximized ? 'Restore panel size' : 'Maximize panel'}
          >
            {maximized ? '⤡ restore' : '⤢ maximize'}
          </button>
        )}
        {onBack && (
          <button type="button" className={styles.control} onClick={onBack}>
            ↩ back
          </button>
        )}
        {onClose && (
          <button type="button" className={styles.control} onClick={onClose} aria-label="Close panel (Esc)">
            × close
          </button>
        )}
      </span>
    </div>
  );
}
