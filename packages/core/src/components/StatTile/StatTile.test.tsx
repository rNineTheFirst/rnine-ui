import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatTile } from './StatTile';

describe('StatTile', () => {
  it('shows the label, value, change in words and hint', () => {
    const { container } = render(
      <StatTile label="Stock value" value="₱1,240,500" change={{ value: '4.2%', direction: 'up' }} hint="vs last month" />,
    );
    expect(screen.getByText('Stock value')).toBeInTheDocument();
    expect(screen.getByText('₱1,240,500')).toBeInTheDocument();
    expect(container).toHaveTextContent('Up 4.2%');
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('keeps direction and tone apart', () => {
    render(<StatTile label="Below reorder point" value="7" change={{ value: '+2', direction: 'up', tone: 'negative' }} />);
    const change = screen.getByText('+2');
    expect(change.className).toMatch(/negative/);
    expect(change).toHaveTextContent('Up +2');
  });

  it('is one link when given href', () => {
    render(<StatTile label="Awaiting approval" value="3" href="#/orders?status=pending" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#/orders?status=pending');
    expect(link).toHaveTextContent('Awaiting approval3');
  });

  it('shows skeletons and is busy while loading', () => {
    const { container } = render(<StatTile label="Deliveries due" value="5" hint="this week" loading />);
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('5')).not.toBeInTheDocument();
    expect(screen.getByText('Deliveries due')).toBeInTheDocument();
  });
});
