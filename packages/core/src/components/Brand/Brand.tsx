import type { HTMLAttributes, ReactNode } from 'react';
import { useMood, type MoodSetting } from '../../hooks/mood';
import { useSystemReducedMotion } from '../../hooks/motion';
import { useMotionSetting } from '../../hooks/motionSetting';
import { useTheme } from '../../provider/ThemeProvider';
import { cx } from '../../utils/cx';
import { SegmentedControl, type SegmentOption } from '../SegmentedControl/SegmentedControl';
import styles from './Brand.module.scss';

type WordmarkProps = HTMLAttributes<HTMLSpanElement> & {
  /** Text to set as a wordmark. Default: the library's name. */
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

/** Wide-tracked uppercase wordmark in the display font (N I N E O S). */
export function Wordmark({ children, size = 'sm', className, ...rest }: WordmarkProps) {
  const { name } = useTheme();
  return (
    <span {...rest} className={cx(styles.wordmark, styles[size], className)}>
      {children ?? name}
    </span>
  );
}

type MoodToggleProps = { className?: string; label?: string; /** Leave out "Auto" (e.g. in a tight HUD). */ withAuto?: boolean };

/**
 * Auto / light mood / dark mood switch, labeled with the library's mood
 * names (NineOS: Auto, Clear, Cipher). Auto follows the library's Auto rule;
 * a click on a mood sets data-scheme on <html> and saves the choice in the
 * browser. Accent element: the selected option's underline.
 */
export function MoodToggle({ className, label = 'Mood', withAuto = true }: MoodToggleProps) {
  const { setting, scheme, moods, setMood } = useMood();
  const options: SegmentOption<MoodSetting>[] = [
    ...(withAuto ? [{ value: 'auto' as const, label: 'Auto' }] : []),
    { value: 'light', label: moods.light.label },
    { value: 'dark', label: moods.dark.label },
  ];
  return (
    <SegmentedControl
      className={className}
      label={label}
      options={options}
      value={withAuto ? setting : scheme}
      onChange={setMood}
    />
  );
}

type Motion = 'on' | 'off';

/**
 * Motion | Still: the viewer's own switch for movement (the backdrop,
 * revealing titles, swaps, page effects), for anyone who wants it calmer without
 * changing their system. Remembered in the browser. When the system already
 * asks for reduced motion, it shows Still and can't be turned back on here.
 * Accent element: the selected option's underline.
 */
export function MotionToggle({ className, label = 'Motion' }: { className?: string; label?: string }) {
  const { still, setStill } = useMotionSetting();
  const system = useSystemReducedMotion();
  return (
    <SegmentedControl<Motion>
      className={className}
      label={label}
      value={still || system ? 'off' : 'on'}
      onChange={(v) => setStill(v === 'off')}
      options={[
        { value: 'on', label: 'Motion' },
        { value: 'off', label: 'Still' },
      ]}
    />
  );
}
