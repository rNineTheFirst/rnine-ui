import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('has a heading at the given level, a description and an action', () => {
    render(
      <EmptyState
        title="No purchase orders yet"
        description="Orders you create show up here."
        action={<button type="button">Create order</button>}
        headingLevel={2}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'No purchase orders yet' })).toBeInTheDocument();
    expect(screen.getByText('Orders you create show up here.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create order' })).toBeInTheDocument();
  });

  it('defaults to an h3', () => {
    render(<EmptyState title="Nothing matches" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Nothing matches' })).toBeInTheDocument();
  });
});
