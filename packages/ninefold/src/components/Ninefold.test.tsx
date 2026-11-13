import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MarkProvider, Panel } from '@rnine/core';
import { ThemeProvider } from '../provider/ThemeProvider';
import { Button } from './Button/Button';
import { Card } from './Card/Card';
import { FieldJournal } from './FieldJournal/FieldJournal';
import { Ink } from './Ink/Ink';
import { isPaper, NOT_PAPER } from './Ink/paper';
import { LanternTrail } from './LanternTrail/LanternTrail';
import { TRAIL_LENGTH, pointAt, stopLengths, walkedD } from './LanternTrail/trailPath';
import { MoonDial } from './MoonDial/MoonDial';
import { moonPhase } from './MoonDial/moon';
import { PenLink } from './PenLink/PenLink';
import { TextReveal } from '../motion/TextReveal';
import { Mark } from '../motion/Mark';
import { swapIn, swapOut } from '../motion/swap';

const STOPS = [
  { id: 'new', label: 'New' },
  { id: 'editions', label: 'Editions' },
  { id: 'preorders', label: 'Preorders' },
  { id: 'contact', label: 'Write to us' },
];

describe('TextReveal (grow and gather)', () => {
  it('gives assistive tech the final text, whatever is on screen', () => {
    render(<TextReveal as="h2" text="Books with a little magic bound in." trigger="mount" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Books with a little magic bound in.' })).toBeInTheDocument();
  });

  it('names buttons it sits in', () => {
    render(<button type="button"><TextReveal text="New on the shelf" trigger="hover" /></button>);
    expect(screen.getByRole('button', { name: 'New on the shelf' })).toBeInTheDocument();
  });

  it("is the title effect of core's components", () => {
    const { container } = render(<ThemeProvider effects={false}><Panel title="Special editions">x</Panel></ThemeProvider>);
    expect(container.querySelector('h2 [aria-hidden="true"]')).toHaveTextContent('Special editions');
  });
});

describe('Mark (the seal)', () => {
  it('is an image with a name when labelled, and hidden when not', () => {
    const { rerender } = render(<Mark label="The Bookshop" />);
    expect(screen.getByRole('img', { name: 'The Bookshop' })).toBeInTheDocument();
    rerender(<Mark />);
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('is poured wax when large, a plain small seal at 40px and below', () => {
    // The sheen and the grain only on the large seal
    const gloss = (c: HTMLElement) => c.querySelectorAll('ellipse, feTurbulence').length;
    const { container, rerender } = render(<Mark size={64} />);
    expect(gloss(container)).toBe(2);
    rerender(<Mark size={40} />);
    expect(gloss(container)).toBe(0);
    rerender(<Mark size={64} variant="simplified" />);
    expect(gloss(container)).toBe(0);
  });

  it('draws the simplified artwork on a small seal', () => {
    const full = '<svg viewBox="0 0 10 10"><path d="M1 1H9V9H1Z"/><path d="M3 3H7V7H3Z"/></svg>';
    const simplified = '<svg viewBox="0 0 10 10"><path d="M2 2H8V8H2Z"/></svg>';
    const { container, rerender } = render(<MarkProvider mark={{ full, simplified }}><Mark size={64} /></MarkProvider>);
    expect(container.querySelectorAll('path[d="M3 3H7V7H3Z"]').length).toBe(2); // the lit edge and the impression
    rerender(<MarkProvider mark={{ full, simplified }}><Mark size={24} /></MarkProvider>);
    expect(container.querySelectorAll('path[d="M2 2H8V8H2Z"]').length).toBe(1);
    expect(container.querySelectorAll('path[d="M3 3H7V7H3Z"]').length).toBe(0);
  });
});

describe('Button (wax stamp)', () => {
  it("keeps the app's own pointer handler and core's props", () => {
    const onPointerDown = vi.fn();
    render(<Button variant="secondary" onPointerDown={onPointerDown}>See preorders</Button>);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'See preorders' }), { button: 0 });
    expect(onPointerDown).toHaveBeenCalledTimes(1);
  });

  it('renders a link with href', () => {
    render(<Button href="/shelf">Browse the shelf</Button>);
    expect(screen.getByRole('link', { name: 'Browse the shelf' })).toHaveAttribute('href', '/shelf');
  });
});

describe('Card (folded corner)', () => {
  it('has a fold, an index chip, and a whole-card link with a name', () => {
    const { container } = render(<Card index="No. 1" href="/books/ash" label="The Cartographer of Ash">x</Card>);
    expect(container.querySelector('[data-r9-card]')).not.toBeNull();
    expect(screen.getByText('No. 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'The Cartographer of Ash' })).toHaveAttribute('href', '/books/ash');
  });
});

describe('PenLink', () => {
  it('marks the current page', () => {
    render(<PenLink href="/new" current>New</PenLink>);
    expect(screen.getByRole('link', { name: 'New' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('LanternTrail', () => {
  it('is a tab list; the stop opens when the lantern arrives', async () => {
    const onChange = vi.fn();
    render(<ThemeProvider reducedMotion effects={false}><LanternTrail label="Shop sections" stops={STOPS} onChange={onChange} /></ThemeProvider>);
    expect(screen.getByRole('tablist', { name: 'Shop sections' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Editions' }));
    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(onChange).toHaveBeenCalledWith('editions');
    expect(screen.getByRole('tab', { name: 'Editions' })).toHaveAttribute('aria-selected', 'true');
  });

  it('moves with the arrow keys, Home and End (one stop in the tab order)', async () => {
    const onChange = vi.fn();
    render(<ThemeProvider reducedMotion effects={false}><LanternTrail label="Shop sections" stops={STOPS} value="new" onChange={onChange} /></ThemeProvider>);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1, -1]);
    tabs[0].focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tabs[1]);
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(tabs[3]);
    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(onChange).toHaveBeenLastCalledWith('contact');
  });

  it('walks a path from end to end, and spreads the stops along it', () => {
    expect(pointAt(0)).toEqual([24, 70]);
    expect(pointAt(TRAIL_LENGTH).map(Math.round)).toEqual([980, 52]);
    const lengths = stopLengths(4);
    expect(lengths[0]).toBeCloseTo(TRAIL_LENGTH * 0.07);
    expect(lengths[3]).toBeCloseTo(TRAIL_LENGTH * 0.93);
    expect(walkedD(TRAIL_LENGTH / 2)).toMatch(/^M24\.0 70\.0L/);
  });
});

describe('FieldJournal', () => {
  it('shows the first notes, dated, with the moon phase filled in', () => {
    render(<FieldJournal entries={[{ text: 'Unpacked forty copies.' }, { text: 'The moon is {moon}.', icon: 'moon' }, { text: 'Mist on the glass.', icon: 'moth' }, { text: 'Not yet.' }]} />);
    const notes = screen.getAllByRole('listitem');
    expect(notes).toHaveLength(3);
    expect(notes[1].textContent).toMatch(/The moon is (new moon|waxing crescent|first quarter|waxing gibbous|full moon|waning gibbous|last quarter|waning crescent)\./);
    expect(notes[0].querySelector('time')).toHaveAttribute('datetime');
  });
});

describe('MoonDial and moonPhase', () => {
  it('knows a full moon and a new moon', () => {
    expect(moonPhase(new Date(Date.UTC(2024, 0, 25, 17, 54))).name).toBe('Full moon');
    expect(moonPhase(new Date(Date.UTC(2024, 0, 11, 11, 57))).name).toBe('New moon');
    expect(moonPhase(new Date(Date.UTC(2024, 0, 25, 17, 54))).lit).toBeGreaterThan(0.99);
  });

  it('describes the sky for screen readers', () => {
    render(<MoonDial date={new Date(2024, 0, 25, 22, 30)} locale="en-GB" />);
    expect(screen.getByRole('img', { name: /Full moon, 100% lit; the moon is out at 22:30/ })).toBeInTheDocument();
  });
});

describe('Ink: where writing may start', () => {
  it('never on links, buttons, fields, cards or [data-ink-off]', () => {
    const { container } = render(
      <div>
        <a href="/x">link</a>
        <button type="button">button</button>
        <input aria-label="field" />
        <div data-r9-card=""><p>card</p></div>
        <div data-ink-off=""><span>off</span></div>
        <section>paper</section>
      </div>,
    );
    for (const el of container.querySelectorAll('a, button, input, [data-r9-card] p, [data-ink-off] span')) expect(isPaper(el, 0, 0)).toBe(false);
    expect(isPaper(container.querySelector('section'), 0, 0)).toBe(true);
    expect(NOT_PAPER).toContain('[data-r9-card]');
  });

  it('is decorative: hidden from assistive tech, and off with reduced motion', () => {
    const { container } = render(<ThemeProvider reducedMotion effects={false}><div style={{ position: 'relative' }}><Ink /></div></ThemeProvider>);
    expect(container.querySelector('[aria-hidden="true"] canvas')).not.toBeNull();
  });
});

describe('swapIn / swapOut', () => {
  it('resolve at once where the Web Animations API is missing', async () => {
    const el = document.createElement('div');
    await expect(swapOut(el)).resolves.toBeUndefined();
    expect(() => swapIn(el)).not.toThrow();
  });
});
