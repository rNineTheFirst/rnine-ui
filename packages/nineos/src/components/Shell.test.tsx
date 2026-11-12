import { useRef, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../provider/ThemeProvider';
import { CommandLine, type CommandSpec } from './CommandLine/CommandLine';
import { Hint } from './Hint/Hint';
import { MenuRail } from '@rnine/core';
import { Panel } from '@rnine/core';
import { PanelBar } from '@rnine/core';
import { PanelStage } from './Panel/PanelStage';
import { SegmentedControl } from '@rnine/core';

const COMMANDS: CommandSpec[] = [
  { name: '/whoami', description: 'who I am' },
  { name: '/projects', description: 'selected work' },
  { name: '/open', description: 'a case study', args: [{ value: 'harbor' }, { value: 'nineos' }] },
];

describe('CommandLine', () => {
  it('runs what is typed', async () => {
    const onRun = vi.fn();
    render(<CommandLine commands={COMMANDS} onRun={onRun} shortcut={false} />);
    await userEvent.type(screen.getByRole('combobox', { name: 'Command' }), '/projects{Enter}');
    expect(onRun).toHaveBeenCalledWith('/projects');
    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it('suggests commands and arguments, completes with Tab', async () => {
    const onRun = vi.fn();
    render(<CommandLine commands={COMMANDS} onRun={onRun} shortcut={false} />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, '/op');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['/open harbora case study', '/open nineosa case study']);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Tab}');
    expect(input).toHaveValue('/open nineos');
  });

  it('runs chips, recalls history and reports first use once', async () => {
    const onRun = vi.fn();
    const onEngage = vi.fn();
    render(<CommandLine commands={COMMANDS} onRun={onRun} chips={['/whoami']} onEngage={onEngage} shortcut={false} />);
    await userEvent.click(screen.getByRole('button', { name: '/whoami' }));
    expect(onRun).toHaveBeenCalledWith('/whoami');
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveValue('/whoami');
    expect(onEngage).toHaveBeenCalledOnce();
  });

  it('clears on Escape, then asks to close', async () => {
    const onEscapeEmpty = vi.fn();
    render(<CommandLine commands={COMMANDS} onRun={() => {}} onEscapeEmpty={onEscapeEmpty} shortcut={false} />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, '/who{Escape}');
    expect(input).toHaveValue('');
    expect(onEscapeEmpty).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(onEscapeEmpty).toHaveBeenCalledOnce();
  });
});

function Stage({ panelKey }: { panelKey: string | null }) {
  return (
    <PanelStage panelKey={panelKey}>
      {panelKey && <Panel title={`Panel ${panelKey}`} reveal={false}>body {panelKey}</Panel>}
    </PanelStage>
  );
}

describe('PanelStage', () => {
  it('swaps instantly with reduced motion, and closes to empty', () => {
    const { rerender } = render(<ThemeProvider reducedMotion effects={false}><Stage panelKey="a" /></ThemeProvider>);
    expect(screen.getByRole('region', { name: 'Panel a' })).toBeInTheDocument();
    rerender(<ThemeProvider reducedMotion effects={false}><Stage panelKey="b" /></ThemeProvider>);
    expect(screen.queryByText('body a')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Panel b' })).toBeVisible();
    rerender(<ThemeProvider reducedMotion effects={false}><Stage panelKey={null} /></ThemeProvider>);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('ends on the newest panel when switched quickly (with motion)', async () => {
    const { rerender } = render(<Stage panelKey="a" />);
    rerender(<Stage panelKey="b" />);
    rerender(<Stage panelKey="c" />);
    await waitFor(() => expect(screen.getByRole('region', { name: 'Panel c' })).toBeVisible());
    expect(screen.getAllByRole('region')).toHaveLength(1);
  });
});

describe('MenuRail and SegmentedControl', () => {
  it('marks the open entry and selects', async () => {
    const onSelect = vi.fn();
    render(<MenuRail items={[{ key: 'whoami', label: 'Whoami' }, { key: 'projects', label: 'Projects' }]} activeKey="projects" onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: /Projects/ })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: /Whoami/ }));
    expect(onSelect).toHaveBeenCalledWith('whoami');
  });

  it('switches between options', async () => {
    function Demo() {
      const [v, setV] = useState<'cli' | 'menu'>('cli');
      return <SegmentedControl label="Navigation mode" value={v} onChange={setV} options={[{ value: 'cli', label: 'CLI' }, { value: 'menu', label: 'Menu' }]} />;
    }
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'CLI' })).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('PanelBar and Hint', () => {
  it('offers back and close', async () => {
    const onBack = vi.fn();
    const onClose = vi.fn();
    render(<PanelBar command="/projects" onBack={onBack} onClose={onClose} />);
    expect(screen.getByText('/projects')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '↩ back' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close panel (Esc)' }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows a dismissible hint only while open', async () => {
    function Demo() {
      const anchor = useRef<HTMLButtonElement>(null);
      const [open, setOpen] = useState(true);
      return (
        <>
          <button ref={anchor} type="button">target</button>
          <Hint open={open} anchor={anchor} onDismiss={() => setOpen(false)}>Start here.</Hint>
        </>
      );
    }
    render(<Demo />);
    expect(screen.getByRole('status')).toHaveTextContent('Start here.');
    await userEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
