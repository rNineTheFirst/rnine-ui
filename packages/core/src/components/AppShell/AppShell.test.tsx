import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppShell } from './AppShell';
import { SideNav, type SideNavGroup } from './SideNav';

const GROUPS: SideNavGroup[] = [
  {
    key: 'main',
    items: [
      { key: 'dashboard', label: 'Dashboard', href: '#/' },
      { key: 'orders', label: 'Purchase orders', href: '#/orders', badge: 3, badgeLabel: '3 awaiting approval' },
    ],
  },
  {
    key: 'admin',
    label: 'Admin',
    items: [
      { key: 'users', label: 'Users' },
      { key: 'billing', label: 'Billing', disabled: true },
    ],
  },
];

function Shell({ onSelect }: { onSelect?: (key: string) => void }) {
  return (
    <AppShell
      brand={<span>Acme</span>}
      nav={<SideNav groups={GROUPS} activeKey="orders" onSelect={onSelect} />}
      header={<input aria-label="Search" />}
      actions={<button type="button">Account</button>}
    >
      <h1>Orders</h1>
    </AppShell>
  );
}

describe('AppShell', () => {
  it('lays out the skip link, navigation, top bar and page', () => {
    render(<Shell />);
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toContainElement(screen.getByRole('textbox', { name: 'Search' }));
    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument();
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main');
    expect(within(main).getByRole('heading', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('opens the navigation from the menu button and closes it with Escape', async () => {
    const user = userEvent.setup();
    render(<Shell />);
    const toggle = screen.getByRole('button', { name: 'Menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveFocus();
    // The page behind can't be reached while it's open
    expect(screen.getByRole('main', { hidden: true }).parentElement).toHaveAttribute('inert');

    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
    expect(screen.getByRole('main').parentElement).not.toHaveAttribute('inert');
  });

  it('closes when a page is picked, and moves focus to the page', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Shell onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Menu' }));
    await user.click(screen.getByRole('link', { name: 'Dashboard' }));
    expect(onSelect).toHaveBeenCalledWith('dashboard');
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('main')).toHaveFocus();
  });
});

describe('SideNav', () => {
  it('marks the active page and names groups by their heading', () => {
    render(<SideNav groups={GROUPS} activeKey="orders" />);
    expect(screen.getByRole('link', { name: /Purchase orders/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
    expect(within(screen.getByRole('list', { name: 'Admin' })).getAllByRole('listitem')).toHaveLength(2);
  });

  it('reads the badge by its label', () => {
    render(<SideNav groups={GROUPS} />);
    // The bare "3" is hidden; jsdom trims the space browsers keep between the (flex item) spans
    expect(screen.getByRole('link', { name: /^Purchase orders ?\(3 awaiting approval\)$/ })).toBeInTheDocument();
  });

  it('makes items without href buttons, and disabled items inert', async () => {
    const onSelect = vi.fn();
    render(<SideNav groups={GROUPS} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Users' }));
    expect(onSelect).toHaveBeenCalledWith('users');
    const billing = screen.getByText('Billing').parentElement!;
    expect(billing).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(billing);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('draws links with renderLink', () => {
    render(
      <SideNav
        groups={GROUPS}
        activeKey="dashboard"
        renderLink={({ href, ...props }) => <a data-router={href} href={`/app${href.slice(1)}`} {...props} />}
      />,
    );
    const link = screen.getByRole('link', { name: 'Dashboard' });
    expect(link).toHaveAttribute('data-router', '#/');
    expect(link).toHaveAttribute('href', '/app/');
    expect(link).toHaveAttribute('aria-current', 'page');
  });
});
