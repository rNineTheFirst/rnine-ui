import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PLAIN_THEME, ThemeConfigProvider } from '../provider/ThemeProvider';
import { TiltCard } from '../motion/TiltCard';

const LIFT = { by: 34, reach: 450, follow: 1 };
const frames = () => new Promise((r) => setTimeout(r, 120));

// A card at 100..300 x 100..200 (its top-right corner at 300, 100)
function place(el: Element) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 100, right: 300, bottom: 200, width: 200, height: 100, x: 100, y: 100, toJSON: () => ({}) });
}
const move = (x: number, y: number, pointerType = 'mouse') => {
  window.dispatchEvent(Object.assign(new Event('pointermove'), { clientX: x, clientY: y, pointerType }));
};
const lift = (el: HTMLElement) => parseFloat(el.style.getPropertyValue('--r9-card-lift') || '0');

afterEach(() => vi.restoreAllMocks());

describe('useCardLift (TiltCard)', () => {
  it('lifts the cut toward the pointer at the top-right corner, and settles when it leaves', async () => {
    const { container } = render(
      <ThemeConfigProvider config={{ ...PLAIN_THEME, lift: LIFT }}>
        <TiltCard>x</TiltCard>
      </ThemeConfigProvider>,
    );
    const card = container.firstElementChild!.firstElementChild as HTMLElement;
    place(card);
    move(298, 102); // at the corner: the whole lift
    await frames();
    expect(lift(card)).toBeGreaterThan(30);
    move(110, 190); // the far corner: less
    await frames();
    expect(lift(card)).toBeGreaterThan(0);
    expect(lift(card)).toBeLessThan(20);
    move(800, 800); // away: none
    await frames();
    expect(lift(card)).toBe(0);
  });

  it('follows the pointer on the page, so the clipped corner still counts', async () => {
    const { container } = render(
      <ThemeConfigProvider config={{ ...PLAIN_THEME, lift: LIFT }}>
        <TiltCard>x</TiltCard>
      </ThemeConfigProvider>,
    );
    const card = container.firstElementChild!.firstElementChild as HTMLElement;
    place(card);
    move(310, 92); // just outside the box, beyond the cut
    await frames();
    expect(lift(card)).toBeGreaterThan(30);
  });

  it('is off without a lift in the theme (NineOS, Plain)', async () => {
    const { container } = render(<TiltCard>x</TiltCard>);
    const card = container.firstElementChild!.firstElementChild as HTMLElement;
    place(card);
    move(298, 102);
    await frames();
    expect(card.style.getPropertyValue('--r9-card-lift')).toBe('');
  });
});
