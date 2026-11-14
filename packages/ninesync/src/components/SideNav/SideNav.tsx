import type { ComponentProps } from 'react';
import { SideNav as CoreSideNav } from '@rnine/core';
import { Glide } from '../../motion/Glide';
import styles from './SideNav.module.scss';

/**
 * The sidebar navigation of AppShell. NineSync marks the current page with
 * a pale bar under its name that glides to the page you pick (260ms).
 */
export function SideNav(props: ComponentProps<typeof CoreSideNav>) {
  return (
    <Glide selector='[aria-current="page"] [class*="r9-SideNav-module_label_"]' thickness={2} offset={3} className={styles.nav}>
      <CoreSideNav {...props} />
    </Glide>
  );
}
