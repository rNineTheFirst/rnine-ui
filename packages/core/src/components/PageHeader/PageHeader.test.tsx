import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('is the page h1 with breadcrumbs, status, description and actions', () => {
    render(
      <PageHeader
        title="PO-2026-0042"
        breadcrumbs={<nav aria-label="Breadcrumb">Purchase orders</nav>}
        meta={<span>Awaiting approval</span>}
        description="Ordered from Northwind Metals."
        actions={<button type="button">Approve</button>}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'PO-2026-0042' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByText('Awaiting approval')).toBeInTheDocument();
    expect(screen.getByText('Ordered from Northwind Metals.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
  });
});
