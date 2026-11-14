import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox, RadioGroup, Switch } from './Choice';

describe('Checkbox and Switch', () => {
  it('toggle by clicking the label', async () => {
    render(
      <>
        <Checkbox label="Email me new posts" />
        <Switch label="Motion" description="Animations and effects" />
      </>,
    );
    const box = screen.getByRole('checkbox', { name: 'Email me new posts' });
    const sw = screen.getByRole('switch', { name: 'Motion' });
    await userEvent.click(screen.getByText('Email me new posts'));
    await userEvent.click(screen.getByText('Motion'));
    expect(box).toBeChecked();
    expect(sw).toBeChecked();
    expect(sw).toHaveAccessibleDescription('Animations and effects');
  });

  it('hides the label visually but keeps it as the name', () => {
    render(<Checkbox label="Clerk: Materials, View" description="Always on" hideLabel />);
    const box = screen.getByRole('checkbox', { name: 'Clerk: Materials, View' });
    expect(box).toHaveAccessibleDescription('Always on');
    expect(screen.getByText('Clerk: Materials, View').parentElement?.className).toMatch(/hiddenText/);
  });
});

describe('RadioGroup', () => {
  it('reports the chosen value and groups under its legend', async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        legend="Mood"
        defaultValue="clear"
        onChange={onChange}
        options={[
          { value: 'clear', label: 'Clear' },
          { value: 'cipher', label: 'Cipher' },
        ]}
      />,
    );
    expect(screen.getByRole('group', { name: 'Mood' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Clear' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Cipher' }));
    expect(onChange).toHaveBeenCalledWith('cipher');
  });
});
