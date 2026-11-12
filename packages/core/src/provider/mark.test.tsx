import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Mark } from '../motion/Mark';
import { ThemeProvider } from './ThemeProvider';
import { MarkProvider, PLACEHOLDER_MARK } from './mark';

const FULL = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 20"><path d="M0 0H10V20Z"/><path d="M1 1H2V2Z"/></svg>';
const SMALL = '<svg viewBox="0 0 10 20"><path d="M0 0H10V20Z"/></svg>';

const paths = (el: Element) => [...el.querySelectorAll(':scope > svg path')].map((p) => p.getAttribute('d'));

describe('Mark', () => {
  it('shows the placeholder frame until an app gives its own mark', () => {
    const { container } = render(<Mark animate="none" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
    expect(paths(container.firstElementChild!)).toEqual([PLACEHOLDER_MARK.full.match(/ d="([^"]+)"/)![1]]);
  });

  it("draws the ThemeProvider mark, filled with the text color", () => {
    const { container } = render(
      <ThemeProvider effects={false} mark={{ full: FULL, simplified: SMALL }}>
        <Mark animate="none" label="Example" />
        <Mark animate="none" variant="simplified" />
      </ThemeProvider>,
    );
    const [full, small] = [...container.querySelectorAll(':scope > span')];
    expect(full.querySelector('svg')).toHaveAttribute('viewBox', '0 0 10 20');
    expect(paths(full)).toEqual(['M0 0H10V20Z', 'M1 1H2V2Z']);
    expect(full.querySelector('path')).toHaveAttribute('fill', 'currentColor');
    expect(full).toHaveAttribute('aria-label', 'Example');
    expect(paths(small)).toEqual(['M0 0H10V20Z']);
  });

  it('uses the full mark when there is no simplified one (MarkProvider, no ThemeProvider)', () => {
    const { container } = render(
      <MarkProvider mark={{ full: FULL }}>
        <Mark animate="none" variant="simplified" />
      </MarkProvider>,
    );
    expect(paths(container.firstElementChild!)).toEqual(['M0 0H10V20Z', 'M1 1H2V2Z']);
  });
});
