import { describe, expect, it } from 'vitest';
import { CLIENT_COLOR_RULES, clientAccent, paleTone, suggestColor } from './clientColors';
import { contrastRatio, hexToHsl, hslToHex, mixHex, parseHex } from './color';

const LIGHT = { bg: '#FFFFFF', surface: '#F5F5F7', success: '#14804A', danger: '#C2361A' };
const DARK = { bg: '#050506', surface: '#111114', success: '#3DDC84', danger: '#FF6B4A' };
const levels = (r: ReturnType<typeof clientAccent>) => Object.fromEntries(r.checks.map((c) => [c.id, c.level]));

describe('color math', () => {
  it('parses short and long hex codes, and nothing else', () => {
    expect(parseHex('#abc')).toBe('#AABBCC');
    expect(parseHex(' 2b4d82 ')).toBe('#2B4D82');
    expect(parseHex('#12345')).toBeNull();
    expect(parseHex('blue')).toBeNull();
  });

  it('measures WCAG contrast', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBe(1);
  });

  it('round-trips HSL and mixes in sRGB', () => {
    for (const hex of ['#2B4D82', '#F07F13', '#14804A', '#000000', '#FFFFFF']) expect(hslToHex(hexToHsl(hex))).toBe(hex);
    expect(mixHex('#000000', '#FFFFFF', 0.5)).toBe('#808080');
  });
});

describe('clientAccent', () => {
  it('uses a dark brand color as it is in the light mood', () => {
    const r = clientAccent({ brand: '#2B4D82' }, 'light', LIGHT);
    expect(r.ok).toBe(true);
    expect(r.usingSuggestion).toBe(false);
    expect(r.roles).toMatchObject({ accent: '#2B4D82', 'accent-text': '#2B4D82', 'on-accent': '#FFFFFF' });
    expect(levels(r)).toEqual({ text: 'ok', 'button-text': 'ok' });
  });

  it('asks for a second color when the brand color is too dark to read in the dark mood', () => {
    const r = clientAccent({ brand: '#2B4D82' }, 'dark', DARK);
    expect(r.ok).toBe(false);
    const text = r.checks.find((c) => c.id === 'text')!;
    expect(text.level).toBe('error');
    expect(text.message).toMatch(/Ask the client for a lighter color for the dark mood/);
    // The suggestion stands in meanwhile, and passes
    expect(r.usingSuggestion).toBe(true);
    expect(r.roles['accent-text']).toBe(text.suggestion);
    for (const bg of [DARK.bg, DARK.surface]) expect(contrastRatio(r.roles['accent-text'], bg)).toBeGreaterThanOrEqual(CLIENT_COLOR_RULES.text);

    const fixed = clientAccent({ brand: '#2B4D82', dark: '#A2C4F6' }, 'dark', DARK);
    expect(fixed.ok).toBe(true);
    expect(fixed.roles['accent-text']).toBe('#A2C4F6');
    // The brand color is too faint as a button on the dark page: buttons take the second color, as meant
    expect(levels(fixed).fill).toBe('ok');
    expect(fixed.roles.accent).toBe('#A2C4F6');
    expect(fixed.roles['on-accent']).toBe('#111111');
  });

  it('never changes a brand color that passes, and explains one that is too light', () => {
    const r = clientAccent({ brand: '#F07F13' }, 'light', LIGHT);
    expect(levels(r)).toMatchObject({ text: 'error', fill: 'warning' });
    expect(r.checks.find((c) => c.id === 'text')!.message).toMatch(/^#F07F13 reads at 2\.\d:1/);
    const dark = clientAccent({ brand: '#F07F13' }, 'dark', DARK);
    expect(dark.ok).toBe(true);
    expect(dark.roles).toMatchObject({ accent: '#F07F13', 'accent-text': '#F07F13', 'on-accent': '#111111' });
  });

  it('rejects a second color that still fails, with a better one', () => {
    const r = clientAccent({ brand: '#F07F13', light: '#E07010' }, 'light', LIGHT);
    const text = r.checks.find((c) => c.id === 'text')!;
    expect(text.level).toBe('error');
    expect(text.message).toMatch(/The second color #E07010 reads at/);
    expect(contrastRatio(text.suggestion!, LIGHT.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('warns when the brand hue sits near the error red or success green', () => {
    expect(levels(clientAccent({ brand: '#C8102E' }, 'light', LIGHT))['status-hue']).toBe('warning');
    expect(clientAccent({ brand: '#1E8C45' }, 'light', LIGHT).checks.find((c) => c.id === 'status-hue')?.message).toMatch(/success green/);
    expect(levels(clientAccent({ brand: '#2B4D82' }, 'light', LIGHT))['status-hue']).toBeUndefined();
  });

  it('says when the input is not a color', () => {
    const r = clientAccent({ brand: 'navy' }, 'light', LIGHT);
    expect(r.ok).toBe(false);
    expect(r.checks[0]).toMatchObject({ id: 'color', level: 'error' });
  });

  it('gives greys a grey pale tone and warns when it is faint', () => {
    expect(paleTone('#555555', 'light')).toBe('#CCCCCC');
    const r = clientAccent({ brand: '#FFF4CC' }, 'light', LIGHT);
    expect(levels(r).pale).toBe('warning');
  });

  it('suggests colors that pass for any brand color', () => {
    for (const c of ['#FFDD00', '#00B5E2', '#7F00FF', '#FF69B4', '#2B4D82', '#000000', '#FFFFFF']) {
      for (const page of [LIGHT, DARK]) {
        const s = suggestColor(c, [page.bg, page.surface], 4.5);
        expect(Math.min(contrastRatio(s, page.bg), contrastRatio(s, page.surface))).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
