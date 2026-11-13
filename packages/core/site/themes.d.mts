import type { SiteInfo } from './types';

export function moodColors(packageDir: string, scheme: 'light' | 'dark'): Record<string, string>;
export function loadSite(): SiteInfo;
