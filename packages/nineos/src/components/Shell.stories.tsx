import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { Backdrop } from '../motion/DotField';
import { rippleAt } from '@rnine/core/motion';
import { Button } from '@rnine/core';
import { Dock, Hud, Kbd } from './Chrome/Chrome';
import { CommandLine, type CommandSpec } from './CommandLine/CommandLine';
import { Hint } from './Hint/Hint';
import { ListRow, RowList } from '@rnine/core';
import { MenuRail } from '@rnine/core';
import { Panel } from '@rnine/core';
import { PanelBar } from '@rnine/core';
import { PanelStage } from './Panel/PanelStage';
import { CaseStudy as CaseStudyBody } from '@rnine/core';
import type { Screenshot } from '@rnine/core';
import { SegmentedControl } from '@rnine/core';
import { Tag } from '@rnine/core';
import { Text } from '@rnine/core';

const meta = {
  title: 'Shell/Patterns',
  parameters: {
    docs: {
      description: {
        component:
          'The pieces of the NineOS shell: `PanelStage` + `Panel` (one panel at a time, signal swap, close to empty), `PanelBar` (what opened it, maximize, back, close), `RowList` + `ListRow` (the title is the link), `CaseStudy` (a case file’s body: facts beside a `ScreenshotCarousel`, swipe, tap to zoom; Visit site), `CommandLine` (prompt, autocomplete, history, chips), `MenuRail` (Menu mode, no command line), `SegmentedControl`, `Hint` (one-time onboarding), `Dock` and `Hud` (fixed chrome instead of a navbar), and `rippleAt()` for the dot field. Rules are in the brand kit’s Patterns chapter.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const COMMANDS: CommandSpec[] = [
  { name: '/whoami', description: 'who I am' },
  { name: '/projects', description: 'selected work' },
  { name: '/open', description: 'a case study', args: [{ value: 'harbor' }, { value: 'nineos' }, { value: 'mk-2' }] },
  { name: '/stack', description: 'tools I use' },
  { name: '/close', description: 'close the panel' },
];
/** Placeholder screenshots for the stories: simple wireframes as SVG. */
function shot(caption: string, kind: number, hue = '#D4006F'): Screenshot {
  const blocks = [
    `<rect x="60" y="90" width="420" height="22" fill="#A2A2AD"/><rect x="60" y="130" width="880" height="56" fill="${hue}" opacity=".25"/><rect x="60" y="210" width="700" height="18" fill="#DBDBE1"/><rect x="60" y="244" width="780" height="18" fill="#DBDBE1"/>`,
    `<rect x="60" y="90" width="260" height="400" fill="#F5F5F7" stroke="#DBDBE1"/><rect x="350" y="90" width="590" height="40" fill="${hue}" opacity=".25"/><rect x="350" y="150" width="590" height="18" fill="#DBDBE1"/><rect x="350" y="186" width="520" height="18" fill="#DBDBE1"/>`,
    `<g fill="#F5F5F7" stroke="#DBDBE1"><rect x="60" y="90" width="200" height="90"/><rect x="290" y="90" width="200" height="90"/><rect x="520" y="90" width="200" height="90"/><rect x="750" y="90" width="190" height="90"/></g><g fill="#0098C7"><rect x="60" y="380" width="60" height="120"/><rect x="150" y="320" width="60" height="180"/><rect x="240" y="260" width="60" height="240"/><rect x="330" y="350" width="60" height="150"/></g>`,
  ];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 562"><rect width="1000" height="562" fill="#FFFFFF"/><rect width="1000" height="44" fill="#F5F5F7"/><rect x="18" y="16" width="12" height="12" fill="${hue}"/><rect x="40" y="16" width="12" height="12" fill="#A2A2AD"/>${blocks[kind % blocks.length]}<text x="940" y="530" text-anchor="end" font-family="monospace" font-size="22" fill="#6E6F7A">${caption}</text></svg>`;
  return { src: `data:image/svg+xml,${encodeURIComponent(svg)}`, alt: `Screenshot placeholder: ${caption}`, caption };
}

const PROJECTS = [
  { slug: 'harbor', name: 'harbor', line: 'A booking and billing app for small studios, self-hosted end to end.', tags: ['React', 'Express', 'Keycloak'], url: 'https://example.com', live: true,
    role: 'Solo: design, frontend, backend, ops', problem: 'Studios took bookings by phone and kept them in spreadsheets.', approach: 'React and Express, Keycloak for sign-in, Docker on a home server behind a Cloudflare Tunnel.', outcome: 'Live at example.com with staging, backups and automatic deploys.', result: 'Deploys itself on every merge, staging first',
    shots: [shot('Home', 0), shot('Calendar', 1), shot('Admin dashboard', 2)] },
  { slug: 'nineos', name: 'NineOS', line: 'The design system these stories are built with.', tags: ['SCSS', 'Storybook'], url: 'https://design.example.com', live: true,
    role: 'Design and build', problem: 'Every project looked different and was styled from scratch.', approach: 'Tokens and components in @rnine/nineos, on a shared core.', outcome: 'New apps start on-brand.',
    shots: [shot('Brand kit', 0), shot('Storybook', 1)] },
  { slug: 'mk-2', name: 'mk-2', line: 'The home server running the sites, CI and the build cache.', tags: ['Docker', 'Tunnel'], url: undefined, live: false,
    role: 'Owner, operator', problem: undefined, approach: undefined, outcome: 'Runs prod, staging and the build cache.',
    shots: [shot('Containers', 2, '#0098C7')] },
];

const MENU = [
  { key: '/whoami', label: 'Whoami' },
  { key: '/projects', label: 'Projects' },
  { key: '/stack', label: 'Stack' },
];

function content(cmd: string, open?: (cmd: string) => void) {
  if (cmd === '/whoami')
    return (
      <Panel index="WHOAMI" title="Sam Doe">
        <Text tone="muted" measure>Full-stack developer who designs, builds and runs their own stack.</Text>
      </Panel>
    );
  if (cmd === '/projects')
    return (
      <Panel index="PROJECTS" title="Selected work">
        <RowList label="Projects">
          {PROJECTS.map((p, i) => (
            <ListRow key={p.slug} index={`PRJ_0${i + 1}`} title={p.name} description={p.line} onSelect={() => open?.(`/open ${p.slug}`)}>
              {p.tags.map((t) => <Tag key={t}>{t}</Tag>)}
            </ListRow>
          ))}
        </RowList>
      </Panel>
    );
  const project = PROJECTS.find((p) => cmd === `/open ${p.slug}`);
  if (project)
    return (
      <Panel index="CASE FILE" title={project.name}>
        <CaseStudyBody
          name={project.name}
          summary={project.line}
          role={project.role}
          problem={project.problem}
          approach={project.approach}
          outcome={project.outcome}
          keyResult={'result' in project ? project.result : undefined}
          screenshots={project.shots}
          tags={project.tags}
          liveUrl={project.url}
          actions={<Button variant="ghost" onClick={() => open?.('/projects')}>all projects</Button>}
        />
      </Panel>
    );
  if (cmd === '/stack')
    return (
      <Panel index="STACK" title="What I build with">
        <Text tone="muted">Grouped by where it’s used, with years, never percentage bars.</Text>
      </Panel>
    );
  return (
    <Panel index="ERR" title="Command not found">
      <Text tone="muted">Try /help.</Text>
    </Panel>
  );
}

/** A contained, working shell built only from @rnine/nineos pieces. */
function ShellDemo() {
  const [mode, setMode] = useState<'cli' | 'menu'>('cli');
  const [stack, setStack] = useState<string[]>([]);
  const [hint, setHint] = useState<'none' | 'start' | 'switch'>('none');
  // Each open panel remembers whether it is maximized; a new one opens at Fit
  const [maximized, setMaximized] = useState<boolean[]>([]);
  const engaged = useRef(false);
  const lineRef = useRef<HTMLDivElement>(null);
  const switchRef = useRef<HTMLDivElement>(null);
  const current = stack.at(-1) ?? null;

  // Hint 1: nothing opened after 4s
  useEffect(() => {
    const t = window.setTimeout(() => setHint((h) => (h === 'none' && !engaged.current ? 'start' : h)), 4000);
    return () => window.clearTimeout(t);
  }, []);

  const open = (cmd: string) => {
    if (cmd === '/close') {
      setStack([]);
      setMaximized([]);
      return;
    }
    const r = lineRef.current?.getBoundingClientRect();
    if (r) rippleAt(r.left + 40, r.top);
    setStack((s) => [...s, cmd]);
    setMaximized((m) => [...m, false]);
  };
  const engage = () => {
    if (engaged.current) return;
    engaged.current = true;
    setHint('switch'); // Hint 2: the CLI can be turned off
  };
  // Opening from inside a panel (a list row, "all projects"): no ripple, so no ref
  const openFromPanel = (cmd: string) => {
    setStack((s) => [...s, cmd]);
    setMaximized((m) => [...m, false]);
  };
  const isMax = maximized.at(-1) ?? false;
  // /contact-style panels can be locked to one size: no maximize for /whoami here
  const lockedSize = current === '/whoami';

  return (
    <div style={{ position: 'relative', minHeight: 560, overflow: 'hidden', padding: 24, boxShadow: 'inset 0 0 0 1px var(--r9-line)' }}>
      {/* The stage column: 720px, or max(720px, 75% of the frame) while maximized */}
      <Backdrop />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <SegmentedControl
          ref={switchRef}
          label="Navigation mode"
          value={mode}
          onChange={(m) => {
            setMode(m);
            setHint('none');
          }}
          options={[{ value: 'cli', label: 'CLI' }, { value: 'menu', label: 'Menu' }]}
        />
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: mode === 'menu' ? '200px minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: 32, alignItems: 'start' }}>
        {mode === 'menu' && <MenuRail items={MENU} activeKey={current} onSelect={open} />}
        <div style={{ display: 'grid', gap: 12, minWidth: 0, width: '100%', maxWidth: isMax ? 'max(720px, 75%)' : 720, justifySelf: 'center', transition: 'max-width .45s cubic-bezier(.2,.7,.2,1)' }}>
          {current && (
            <PanelBar
              command={mode === 'cli' ? current : undefined}
              maximized={isMax}
              onToggleMaximize={lockedSize ? undefined : () => setMaximized((m) => [...m.slice(0, -1), !isMax])}
              onBack={stack.length > 1 ? () => { setStack((s) => s.slice(0, -1)); setMaximized((m) => m.slice(0, -1)); } : undefined}
              onClose={() => { setStack([]); setMaximized([]); }}
            />
          )}
          <PanelStage panelKey={current ? `${stack.length}:${current}` : null}>{current && content(current, openFromPanel)}</PanelStage>
        </div>
      </div>
      {mode === 'cli' && (
        <div style={{ position: 'relative', marginTop: 32 }}>
          <CommandLine
            ref={lineRef}
            commands={COMMANDS}
            chips={['/whoami', '/projects', '/stack']}
            onRun={open}
            onEngage={engage}
            onEscapeEmpty={() => { setStack([]); setMaximized([]); }}
            shortcut={false}
          />
        </div>
      )}
      <Hint open={hint === 'start'} anchor={lineRef} placement="top" onDismiss={() => setHint('none')} dismissLabel="OK">
        <p><strong>Start here.</strong> Type a command like <code>/whoami</code>, or tap one above the line.</p>
      </Hint>
      <Hint open={hint === 'switch' && mode === 'cli'} anchor={switchRef} placement="bottom" align="end" autoHide={8000} onDismiss={() => setHint('none')}>
        <p><strong>Not into typing?</strong> Switch the CLI off here and browse with a menu instead.</p>
      </Hint>
    </div>
  );
}

export const Shell: Story = {
  render: () => <ShellDemo />,
  parameters: { docs: { description: { story: 'Starts empty. Wait 4s for the first hint; use the line and the second hint points at the mode switch. Switch panels quickly: it always ends on the newest. × close (or Esc in the empty line) returns to an empty stage.' } } },
};

function StageDemo() {
  const [key, setKey] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['/whoami', '/projects', '/stack'].map((k) => (
          <button key={k} type="button" onClick={() => setKey(k)}>{k}</button>
        ))}
        <button type="button" onClick={() => setKey(null)}>close</button>
      </div>
      <PanelStage panelKey={key}>{key && content(key)}</PanelStage>
    </div>
  );
}

export const CaseStudy: Story = {
  name: 'Case study (list, carousel, Visit site)',
  render: () => {
    function Demo() {
      const [cmd, setCmd] = useState('/projects');
      return <div style={{ maxWidth: 760 }}>{content(cmd, setCmd)}</div>;
    }
    return <Demo />;
  },
  parameters: { docs: { description: { story: 'In a list, the title is the link (the whole row is clickable; no buttons on the right). A case study shows its screenshots in a carousel: swipe, arrows or dots, and tap a shot to zoom (click or pinch; drag to pan). Live projects get an outline "Visit site" that opens a new tab.' } } },
};

export const SignalSwap: Story = { name: 'PanelStage (signal swap)', render: () => <StageDemo /> };

export const Command: Story = {
  name: 'CommandLine',
  render: () => (
    <div style={{ paddingTop: 260, maxWidth: 640 }}>
      <CommandLine commands={COMMANDS} chips={['/whoami', '/projects', '/stack']} onRun={() => {}} shortcut={false} />
    </div>
  ),
};

export const Rail: Story = {
  name: 'MenuRail',
  render: () => <div style={{ maxWidth: 260 }}><MenuRail items={MENU} activeKey="/projects" onSelect={() => {}} /></div>,
};

export const Chrome: Story = {
  name: 'Hud and Dock',
  render: () => (
    <div style={{ minHeight: 420 }}>
      <Hud corner="top-left"><Text variant="label">top-left HUD</Text></Hud>
      <Hud corner="top-right"><SegmentedControl label="Mood" value="cipher" onChange={() => {}} options={[{ value: 'clear', label: 'Clear' }, { value: 'cipher', label: 'Cipher' }]} /></Hud>
      <Dock><CommandLine commands={COMMANDS} chips={['/whoami', '/projects']} onRun={() => {}} shortcut={false} /></Dock>
      <p style={{ padding: '96px 24px', color: 'var(--r9-fg-muted)' }}>Fixed chrome instead of a navbar. Shortcut chip: <Kbd>Ctrl K</Kbd></p>
    </div>
  ),
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 460 } } },
};
