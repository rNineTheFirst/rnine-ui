import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tabs } from './Tabs';

const ITEMS = [
  { id: 'work', label: 'Work', content: <p>Projects</p> },
  { id: 'writing', label: 'Writing', content: <p>Posts</p> },
  { id: 'lab', label: 'Lab', content: <p>Experiments</p>, disabled: true },
];

describe('Tabs', () => {
  it('shows the selected panel, labelled by its tab', () => {
    render(<Tabs label="Sections" items={ITEMS} />);
    expect(screen.getByRole('tablist', { name: 'Sections' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Work' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Work' })).toHaveTextContent('Projects');
  });

  it('moves with the arrow keys and skips disabled tabs', async () => {
    render(<Tabs label="Sections" items={ITEMS} />);
    screen.getByRole('tab', { name: 'Work' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Writing' })).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Writing' })).toHaveTextContent('Posts');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Work' })).toHaveFocus();
  });

  it('selects on click', async () => {
    render(<Tabs label="Sections" items={ITEMS} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Writing' }));
    expect(screen.getByRole('tab', { name: 'Writing' })).toHaveAttribute('aria-selected', 'true');
  });
});
