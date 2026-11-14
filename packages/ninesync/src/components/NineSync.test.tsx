import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppShell, Panel } from '@rnine/core';
import { ThemeProvider } from '../provider/ThemeProvider';
import { ClientTheme } from '../client/ClientTheme';
import { syncColors } from '../client/syncColors';
import { Tabs } from './Tabs/Tabs';
import { SideNav } from './SideNav/SideNav';
import { PageHeader } from './PageHeader/PageHeader';
import { LiveDot } from './LiveDot/LiveDot';
import { TextReveal } from '../motion/TextReveal';
import { splitMark } from '../motion/splitMark';
import { CountUp } from '../motion/CountUp';
import { cascade, watchCascades } from '../motion/screenCascade';
import { swapIn, swapOut } from '../motion/swap';
import { wash } from '../motion/wash';

afterEach(() => vi.restoreAllMocks());

describe('TextReveal (the mark draws)', () => {
  it('marks the last word and gives assistive tech the whole title', () => {
    expect(splitMark('Raw materials')).toEqual(['Raw ', 'materials']);
    expect(splitMark('Dashboard')).toEqual(['', 'Dashboard']);
    const { container } = render(<TextReveal as="h2" text="Purchase orders" trigger="mount" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Purchase orders' })).toBeInTheDocument();
    expect(container.querySelector('.mark')).toHaveTextContent('orders');
  });

  it('waits hidden until it plays (mount and view), never for hover or reduced motion', () => {
    const mount = render(<TextReveal as="h2" text="Suppliers" trigger="mount" />);
    expect(mount.container.querySelector('h2')).toHaveClass('waiting');
    mount.unmount();
    const hover = render(<TextReveal text="Suppliers" trigger="hover" />);
    expect(hover.container.firstElementChild).toHaveClass('rest');
    hover.unmount();
    const still = render(<ThemeProvider reducedMotion effects={false}><TextReveal as="h2" text="Suppliers" trigger="mount" /></ThemeProvider>);
    expect(still.container.querySelector('h2')).toHaveClass('rest');
  });

  it('plays after its delay', () => {
    vi.useFakeTimers();
    const { container } = render(<TextReveal as="h2" text="Receiving" trigger="mount" delay={100} />);
    act(() => vi.advanceTimersByTime(100));
    expect(container.querySelector('h2')).toHaveClass('playing');
    vi.useRealTimers();
  });

  it("is the title effect of core's components", () => {
    const { container } = render(<ThemeProvider effects={false}><Panel title="Stock levels">x</Panel></ThemeProvider>);
    expect(container.querySelector('h2 .mark')).toHaveTextContent('levels');
  });
});

describe('Tabs and SideNav (the mark glides)', () => {
  const items = [
    { id: 'all', label: 'All', content: 'All items' },
    { id: 'low', label: 'Low stock', content: 'Low items' },
  ];

  it('keeps core’s tabs and keyboard, with one gliding mark', async () => {
    const { container } = render(<Tabs label="Stock" items={items} />);
    expect(container.querySelectorAll('[aria-hidden="true"].mark')).toHaveLength(1);
    screen.getByRole('tab', { name: 'All' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Low stock' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Low items');
  });

  it('marks the current page in the side nav', () => {
    const groups = [{ key: 'main', items: [{ key: 'mat', label: 'Materials', href: '#mat' }, { key: 'sup', label: 'Suppliers', href: '#sup' }] }];
    render(
      <AppShell nav={<SideNav groups={groups} activeKey="mat" />}>
        <p>Page</p>
      </AppShell>,
    );
    expect(screen.getByRole('link', { name: 'Materials' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('PageHeader', () => {
  it('draws the mark under a text title, which stays the page’s h1', () => {
    const { container } = render(<PageHeader title="Raw materials" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Raw materials' })).toBeInTheDocument();
    expect(container.querySelector('h1 .mark')).toHaveTextContent('materials');
  });
});

describe('LiveDot', () => {
  it('is named by its words, or by its title alone', () => {
    const { rerender } = render(<LiveDot>Synced 2 min ago</LiveDot>);
    expect(screen.getByText('Synced 2 min ago')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
    rerender(<LiveDot state="idle" />);
    expect(screen.getByRole('img', { name: 'Idle' })).toBeInTheDocument();
  });
});

describe('CountUp', () => {
  it('gives screen readers the final number, and with reduced motion shows it at once', () => {
    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    const { container } = render(
      <ThemeProvider reducedMotion effects={false}>
        <CountUp value={1240500} format={fmt} />
      </ThemeProvider>,
    );
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('$1,240,500');
    expect(container.querySelector('.sr')).toHaveTextContent('$1,240,500');
  });
});

describe('ClientTheme', () => {
  it('writes the client’s roles for both moods', () => {
    const { container } = render(<ClientTheme colors={{ brand: '#0B6E4F', dark: '#5FD3A8' }} />);
    const css = container.querySelector('style')!.textContent!;
    expect(css).toContain(`--r9-accent: ${syncColors({ brand: '#0B6E4F', dark: '#5FD3A8' }).light.roles.accent}`);
    expect(css).toContain('--r9-accent-text: #5FD3A8');
  });

  it('warns which second color to ask for when one fails', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<ClientTheme colors={{ brand: '#F07F13' }} />);
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/Ask the client for a darker color for the light mood/));
  });
});

describe('motion helpers', () => {
  it('do nothing where the Web Animations API is missing', async () => {
    const el = document.createElement('div');
    await expect(swapOut(el)).resolves.toBeUndefined();
    expect(() => swapIn(el)).not.toThrow();
    expect(() => wash(el)).not.toThrow();
    expect(() => cascade(el)).not.toThrow();
  });

  it('cascade staggers a container’s children 40ms apart', () => {
    const box = document.createElement('div');
    box.innerHTML = '<p>a</p><p>b</p><p>c</p>';
    const animate = vi.fn();
    for (const child of box.children) (child as HTMLElement).animate = animate;
    box.animate = vi.fn();
    cascade(box);
    expect(animate.mock.calls.map((c) => c[1].delay)).toEqual([0, 40, 80]);
  });

  it('PageEffects plays the cascade on content marked data-cascade as it appears', async () => {
    const animate = vi.fn();
    const proto = HTMLElement.prototype as unknown as { animate?: unknown };
    const had = proto.animate;
    proto.animate = animate;
    const stop = watchCascades();
    const screenEl = document.createElement('main');
    screenEl.setAttribute('data-cascade', '');
    screenEl.innerHTML = '<section>a</section><section>b</section>';
    document.body.append(screenEl);
    await Promise.resolve();
    expect(animate).toHaveBeenCalledTimes(2);
    stop();
    screenEl.remove();
    proto.animate = had;
  });
});
