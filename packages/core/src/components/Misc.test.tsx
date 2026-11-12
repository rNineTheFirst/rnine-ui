import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Avatar } from './Avatar/Avatar';
import { Breadcrumbs } from './Breadcrumbs/Breadcrumbs';
import { SkipLink } from './PageTools/PageTools';
import { Tooltip } from './Tooltip/Tooltip';

describe('Tooltip', () => {
  it('describes its trigger and shows on focus, hides on Escape', async () => {
    render(
      <Tooltip content="Copies the CSS variable">
        <button type="button">Copy</button>
      </Tooltip>,
    );
    const button = screen.getByRole('button', { name: 'Copy' });
    expect(button).toHaveAccessibleDescription('Copies the CSS variable');
    await userEvent.tab();
    expect(screen.getByRole('tooltip', { hidden: true }).className).toMatch(/open/);
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('tooltip', { hidden: true }).className).not.toMatch(/open/);
  });
});

describe('Breadcrumbs', () => {
  it('links the trail and marks the current page', () => {
    render(<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: 'Post' }]} />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
    expect(screen.getByText('Post')).toHaveAttribute('aria-current', 'page');
  });

  it('uses a custom link renderer', () => {
    render(
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Now' }]}
        renderLink={(item, children) => <a href={`#router${item.href}`}>{children}</a>}
      />,
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '#router/');
  });
});

describe('Avatar', () => {
  it('shows initials without a photo, and after a photo fails', () => {
    const { rerender } = render(<Avatar name="Arnin Mendoza" />);
    expect(screen.getByRole('img', { name: 'Arnin Mendoza' })).toHaveTextContent('AM');
    rerender(<Avatar name="Rae Nolan" src="/missing.jpg" />);
    fireEvent.error(screen.getByRole('img', { name: 'Rae Nolan' }));
    expect(screen.getByRole('img', { name: 'Rae Nolan' })).toHaveTextContent('RN');
  });
});

describe('SkipLink', () => {
  it('points at the main content', () => {
    render(<SkipLink />);
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
  });
});
