import type { ComponentProps } from 'react';
import { Tabs as CoreTabs } from '@rnine/core';
import { cx } from '@rnine/core/kit';
import { Glide } from '../../motion/Glide';
import styles from './Tabs.module.scss';

/**
 * Tabs with full keyboard support (arrow keys, Home, End). NineSync's tabs
 * are plain text; the selected one is marked by a pale bar that glides to
 * the tab you pick (260ms).
 */
export function Tabs({ className, ...props }: ComponentProps<typeof CoreTabs>) {
  return (
    <Glide selector='[role="tab"][aria-selected="true"]' className={cx(styles.tabs, className)}>
      <CoreTabs {...props} />
    </Glide>
  );
}
