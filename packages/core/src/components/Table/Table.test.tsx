import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { pageList } from '../../utils/pageList';
import { Pagination } from './Pagination';
import { Table, type Column } from './Table';

type Row = { id: number; name: string; size: number };
const DATA: Row[] = [
  { id: 1, name: 'beta', size: 20 },
  { id: 2, name: 'alpha', size: 3 },
  { id: 3, name: 'gamma', size: 100 },
];
const COLS: Column<Row>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'size', header: 'Size', sortable: true },
];
const names = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0].textContent);

describe('Table', () => {
  it('sorts by a column, ascending then descending, and reports it', async () => {
    render(<Table data={DATA} columns={COLS} keyExtractor={(r) => r.id} caption="Files" />);
    expect(screen.getByRole('table', { name: 'Files' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Size' }));
    expect(names()).toEqual(['alpha', 'beta', 'gamma']);
    expect(screen.getByRole('columnheader', { name: 'Size' })).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(screen.getByRole('button', { name: 'Size' }));
    expect(names()).toEqual(['gamma', 'beta', 'alpha']);
  });

  it('selects rows and all rows', async () => {
    const onSelectionChange = vi.fn();
    render(
      <Table data={DATA} columns={COLS} keyExtractor={(r) => r.id} selectable selectedRows={[]} onSelectionChange={onSelectionChange} rowLabel={(r) => `Select ${r.name}`} />,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select alpha' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([2]);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([1, 2, 3]);
  });

  it('opens rows by click and by keyboard', async () => {
    const onRowClick = vi.fn();
    render(<Table data={DATA} columns={COLS} keyExtractor={(r) => r.id} onRowClick={onRowClick} />);
    const rows = screen.getAllByRole('row');
    await userEvent.click(rows[1]);
    rows[2].focus();
    await userEvent.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenNthCalledWith(1, DATA[0], 0);
    expect(onRowClick).toHaveBeenNthCalledWith(2, DATA[1], 1);
  });

  it('leaves clicks and keys on links and buttons inside a row to them', async () => {
    const onRowClick = vi.fn();
    const onButton = vi.fn();
    const cols: Column<Row>[] = [
      { key: 'name', header: 'Name', render: (r) => <a href={`#/${r.name}`}>{r.name}</a> },
      { key: 'act', header: 'Action', render: (r) => <button type="button" onClick={onButton}>Open {r.name}</button> },
    ];
    render(<Table data={DATA} columns={cols} keyExtractor={(r) => r.id} onRowClick={onRowClick} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open beta' }));
    screen.getByRole('link', { name: 'alpha' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onButton).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
    await userEvent.click(screen.getAllByRole('cell')[0]);
    expect(onRowClick).toHaveBeenCalledWith(DATA[0], 0);
  });

  it('shows the empty message', () => {
    render(<Table data={[]} columns={COLS} keyExtractor={(r: Row) => r.id} emptyMessage="No files." />);
    expect(screen.getByText('No files.')).toBeInTheDocument();
  });

  it('aligns numeric columns to the end', () => {
    render(<Table data={DATA} columns={[COLS[0], { ...COLS[1], numeric: true }]} keyExtractor={(r) => r.id} />);
    const header = screen.getByRole('columnheader', { name: 'Size' });
    const cell = screen.getByRole('cell', { name: '20' });
    expect(header.className).toMatch(/end/);
    expect(header.className).toMatch(/numeric/);
    expect(cell.className).toMatch(/end/);
  });

  it('adds a totals row from the columns’ footers, over the sorted rows', async () => {
    const cols: Column<Row>[] = [
      { ...COLS[0], footer: 'Total' },
      { ...COLS[1], numeric: true, footer: (rows) => rows.reduce((n, r) => n + r.size, 0) },
    ];
    const { container } = render(<Table data={DATA} columns={cols} keyExtractor={(r) => r.id} selectable />);
    const foot = container.querySelector('tfoot')!;
    const cells = within(foot).getAllByRole('cell');
    // The checkbox column gets an empty cell
    expect(cells.map((c) => c.textContent)).toEqual(['', 'Total', '123']);
  });

  it('leaves the totals row out while loading or empty', () => {
    const cols: Column<Row>[] = [{ ...COLS[0], footer: 'Total' }, COLS[1]];
    const { container, rerender } = render(<Table data={DATA} columns={cols} keyExtractor={(r) => r.id} loading />);
    expect(container.querySelector('tfoot')).toBeNull();
    rerender(<Table data={[]} columns={cols} keyExtractor={(r: Row) => r.id} />);
    expect(container.querySelector('tfoot')).toBeNull();
  });

  it('scrolls inside itself at maxHeight', () => {
    const { container } = render(<Table data={DATA} columns={COLS} keyExtractor={(r) => r.id} maxHeight="20rem" />);
    const wrap = container.firstElementChild as HTMLElement;
    expect(wrap.style.maxHeight).toBe('20rem');
    expect(wrap.className).toMatch(/scroll/);
  });
});

describe('Pagination', () => {
  it('lists pages with gaps around the current one', () => {
    expect(pageList(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageList(6, 12)).toEqual([1, null, 5, 6, 7, null, 12]);
    expect(pageList(1, 12)).toEqual([1, 2, 3, 4, null, 12]);
  });

  it('marks the current page and moves between pages', async () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} totalItems={48} itemsPerPage={10} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('11–20 of 48')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await userEvent.click(screen.getByRole('button', { name: 'Page 5' }));
    expect(onPageChange.mock.calls).toEqual([[3], [5]]);
  });
});
