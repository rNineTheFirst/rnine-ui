import type { SiteInfo } from './types';

export function moodColors(packageDir: string, scheme: 'light' | 'dark'): Record<string, string>;
export function shapeRule(packageDir: string): { cut: number; round: number };
export function plateEmblem(options: { monogram: string; colors: Record<string, string>; shape: { cut: number; round: number } }): string;
export function loadSite(): SiteInfo;
