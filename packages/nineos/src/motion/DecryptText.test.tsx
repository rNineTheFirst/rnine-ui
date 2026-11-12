import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../provider/ThemeProvider';
import { TextReveal } from './DecryptText';
import { Panel } from '@rnine/core';
import { Magnet } from '@rnine/core/motion';
import { DECRYPT_GLYPHS, decryptFrame } from './useDecrypt';

describe('decryptFrame', () => {
  const text = 'Systems that feel alive.';

  it('is deterministic: same input, same frame', () => {
    expect(decryptFrame(text, 0.4, 420)).toEqual(decryptFrame(text, 0.4, 420));
  });

  it('uses the terminal symbols for letters and never scrambles spaces or punctuation', () => {
    const frame = decryptFrame(text, 0, 30);
    Array.from(text).forEach((c, i) => {
      if (c === ' ' || c === '.') expect(frame[i]).toBeNull();
      else expect(DECRYPT_GLYPHS).toContain(frame[i]);
    });
  });

  it('gives each letter its own varied sequence (no short repeating cycle)', () => {
    const seq = Array.from({ length: 24 }, (_, k) => decryptFrame('Sy', 0, k * 70)[0]);
    expect(new Set(seq).size).toBeGreaterThanOrEqual(8);
  });

  it('keeps neighbouring letters out of step', () => {
    // Over the run, adjacent letters show the same symbol only by chance, not always
    const same = Array.from({ length: 30 }, (_, k) => {
      const f = decryptFrame('abcdef', 0, k * 33);
      return f[0] === f[1];
    }).filter(Boolean).length;
    expect(same).toBeLessThan(15);
  });

  it('decodes left to right and ends fully decoded', () => {
    const mid = decryptFrame(text, 0.6, 600);
    const firstScrambled = mid.findIndex((g) => g !== null);
    expect(firstScrambled).toBeGreaterThan(0);
    expect(mid.slice(0, firstScrambled).every((g) => g === null)).toBe(true);
    expect(decryptFrame(text, 1, 1000).every((g) => g === null)).toBe(true);
  });

  it('holds every letter scrambled at the start', () => {
    expect(decryptFrame('abc', 0.1, 100).every((g) => g !== null)).toBe(true);
  });
});

describe('TextReveal (decrypt) layout', () => {
  it('keeps the real text in the layout layer', () => {
    const { container } = render(<TextReveal text="Hello there" trigger="hover" />);
    // At rest: one visible layer with the final text, no overlay
    const visible = container.querySelectorAll('[aria-hidden="true"]');
    expect(visible).toHaveLength(1);
    expect(visible[0].textContent).toBe('Hello there');
  });
});

describe('TextReveal (decrypt)', () => {
  it('gives assistive tech the final text, whatever is on screen', () => {
    render(<TextReveal as="h2" text="Systems that feel alive." trigger="mount" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Systems that feel alive.' })).toBeInTheDocument();
  });

  it('shows the final text at rest', () => {
    const { container } = render(<TextReveal text="Hello" trigger="hover" />);
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('Hello');
  });

  it('names buttons it sits in (screen readers get the text, not the glyphs)', () => {
    render(
      <button type="button">
        <TextReveal text="Projects" trigger="hover" />
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Projects' })).toBeInTheDocument();
  });
});

describe('ThemeProvider', () => {
  it('renders the app and keeps motion wrappers inert when motion is off', () => {
    render(
      <ThemeProvider reducedMotion effects={false}>
        <Magnet>
          <button type="button">Go</button>
        </Magnet>
      </ThemeProvider>,
    );
    const button = screen.getByRole('button', { name: 'Go' });
    expect(button.parentElement).not.toHaveAttribute('style');
  });
});

describe('core components, NineOS effects', () => {
  it("decode a Panel title (core's Panel, NineOS's TextReveal)", () => {
    const { container } = render(<ThemeProvider effects={false}><Panel title="Selected work">x</Panel></ThemeProvider>);
    // The decrypt draws its glyph layer, hidden from screen readers
    expect(container.querySelector('h2 [aria-hidden="true"]')).not.toBeNull();
  });

  it("with revealOnce, decode a title the first time in a session, then it's simply there", () => {
    sessionStorage.clear();
    const panel = () => render(<ThemeProvider effects={false} revealOnce><Panel title="Case files">x</Panel></ThemeProvider>);
    const first = panel();
    expect(first.container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    first.unmount();
    const again = panel();
    expect(again.getByRole('heading', { name: 'Case files' }).querySelector('[aria-hidden="true"]')).toBeNull();
  });
});
