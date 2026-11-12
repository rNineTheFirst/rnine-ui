import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('is a button of type "button" by default and handles clicks', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders a link when given href', () => {
    render(<Button href="/work">Work</Button>);
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/work');
  });

  it('does not fire when disabled', async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies the variant class', () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button').className).toMatch(/outline/);
  });
});
