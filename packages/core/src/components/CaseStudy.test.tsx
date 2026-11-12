import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button/Button';
import { CaseStudy } from './CaseStudy/CaseStudy';
import { Prose } from './Prose/Prose';
import { ListRow, RowList } from './ListRow/ListRow';
import { PanelBar } from './Panel/PanelBar';
import { ScreenshotCarousel } from './ScreenshotCarousel/ScreenshotCarousel';

const SHOTS = [
  { src: 'home.png', alt: 'The home page', caption: 'Home' },
  { src: 'editor.png', alt: 'The post editor', caption: 'Post editor' },
  { src: 'admin.png', alt: 'The admin dashboard', caption: 'Admin dashboard' },
];

describe('ListRow', () => {
  it('makes the title the button that opens the item', async () => {
    const onSelect = vi.fn();
    render(
      <RowList label="Projects">
        <ListRow index="PRJ_01" title="harbor" description="This site" onSelect={onSelect} />
      </RowList>,
    );
    expect(screen.getByRole('list', { name: 'Projects' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /harbor/ }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.getByRole('heading', { name: /harbor/ })).toBeInTheDocument();
  });

  it('renders a real link when given an href', () => {
    render(<ListRow meta="2026-11-07" title="The build cache went live" href="/blog/build-cache" />);
    expect(screen.getByRole('link', { name: /The build cache went live/ })).toHaveAttribute('href', '/blog/build-cache');
  });
});

describe('ScreenshotCarousel', () => {
  it('steps through the shots with the arrows and the dots', async () => {
    render(<ScreenshotCarousel shots={SHOTS} label="Screenshots of harbor" />);
    expect(screen.getByRole('region', { name: 'Screenshots of harbor' })).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous screenshot' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Next screenshot' }));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Screenshot 2: Post editor' })).toHaveAttribute('aria-current', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Screenshot 3: Admin dashboard' }));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next screenshot' })).toBeDisabled();
  });

  it('opens a shot full screen, steps there, and closes without bubbling Escape', async () => {
    const onPageEscape = vi.fn();
    document.addEventListener('keydown', onPageEscape);
    render(<ScreenshotCarousel shots={SHOTS} label="Screenshots" />);

    await userEvent.click(screen.getByRole('button', { name: 'Zoom in: Home' }));
    const dialog = screen.getByRole('dialog', { name: 'Screenshot: Home' });
    expect(within(dialog).getByText('1 / 3', { exact: false })).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Next screenshot' }));
    expect(screen.getByRole('dialog', { name: 'Screenshot: Post editor' })).toBeInTheDocument();

    const zoom = within(dialog).getByRole('button', { name: 'Zoom in' });
    await userEvent.click(zoom);
    expect(within(dialog).getByRole('button', { name: 'Fit' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onPageEscape).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole('button', { name: '× close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    document.removeEventListener('keydown', onPageEscape);
  });
});

describe('PanelBar maximize and external buttons', () => {
  it('toggles maximize, and hides it for a locked panel', async () => {
    function Demo() {
      const [max, setMax] = useState(false);
      return <PanelBar command="/open harbor" maximized={max} onToggleMaximize={() => setMax((m) => !m)} onClose={() => {}} />;
    }
    const { unmount } = render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Maximize panel' }));
    expect(screen.getByRole('button', { name: 'Restore panel size' })).toHaveAttribute('aria-pressed', 'true');
    unmount();
    render(<PanelBar command="/contact" onClose={() => {}} />);
    expect(screen.queryByRole('button', { name: /Maximize/ })).not.toBeInTheDocument();
  });

  it('opens external links in a new tab and says so', () => {
    render(<Button variant="outline" href="https://design.example.com" external>Visit site</Button>);
    const link = screen.getByRole('link', { name: /^Visit site\s*\(opens in a new tab\)$/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('CaseStudy', () => {
  it('shows the facts it has, the screenshots and Visit site', () => {
    render(
      <CaseStudy
        name="harbor"
        summary="This site, self-hosted."
        role="Solo"
        problem="  "
        outcome="Live at example.com"
        screenshots={SHOTS.map(({ src, alt, caption }) => ({ src, alt, caption }))}
        tags={['React']}
        liveUrl="https://example.com"
      />,
    );
    expect(screen.getByText('This site, self-hosted.')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Stack')).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    // No key result given: no Result line
    expect(screen.queryByText('Result')).not.toBeInTheDocument();
    // Empty facts are left out
    expect(screen.queryByText('Problem')).not.toBeInTheDocument();
    expect(screen.queryByText('Approach')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Screenshots of harbor' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Visit site/ })).toHaveAttribute('href', 'https://example.com');
  });

  it('puts the key result, role and stack at a glance', () => {
    render(<CaseStudy name="turbo-cache" summary="A build cache." role="Solo" client="Acme" keyResult="CI builds from 6 min to 40 s" tags={['Turborepo', 'Docker']} />);
    const glance = screen.getByLabelText('At a glance');
    expect(glance).toHaveTextContent('ResultCI builds from 6 min to 40 s');
    expect(glance).toHaveTextContent('RoleSolo');
    expect(glance).toHaveTextContent('ClientAcme');
    expect(glance).toHaveTextContent('StackTurborepoDocker');
  });

  it('places extra sections between the facts and the actions', () => {
    render(<CaseStudy name="suite" summary="All of it." outcome="Live" liveUrl="https://example.com"><section aria-label="Live status">up</section></CaseStudy>);
    const extra = screen.getByRole('region', { name: 'Live status' });
    expect(extra.compareDocumentPosition(screen.getByText('Live')) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    expect(extra.compareDocumentPosition(screen.getByRole('link', { name: /Visit site/ })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('has no Visit site when the project is not live', () => {
    render(<CaseStudy name="mk-2" summary="The home server." />);
    expect(screen.queryByRole('link', { name: /Visit site/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
});

describe('Prose', () => {
  it('renders the article and strips anything unsafe', () => {
    const { container } = render(<Prose html={'<h2>Setup</h2><p>Hi <a href="/x" onclick="alert(1)">link</a></p><script>alert(1)</script><img src="x" onerror="alert(1)">'} />);
    expect(screen.getByRole('heading', { name: 'Setup' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'link' })).not.toHaveAttribute('onclick');
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).not.toHaveAttribute('onerror');
  });
});
