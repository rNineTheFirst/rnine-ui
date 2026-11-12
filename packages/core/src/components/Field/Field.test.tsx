import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Select, TextArea, TextField } from './Field';

describe('TextField', () => {
  it('labels the input and links the hint', () => {
    render(<TextField label="Email" hint="Only used to reply." />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAccessibleDescription('Only used to reply.');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('marks the field invalid and announces the error', () => {
    render(<TextField label="Email" hint="Hint" error="Enter an email address." />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter an email address.');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter an email address.');
  });

  it('can be marked invalid when the error shows on another field', () => {
    render(<TextField label="Email" aria-invalid />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('accepts typing', async () => {
    render(<TextField label="Name" />);
    await userEvent.type(screen.getByLabelText('Name'), 'Sam');
    expect(screen.getByLabelText('Name')).toHaveValue('Sam');
  });
});

describe('TextArea and Select', () => {
  it('label their controls', () => {
    render(
      <>
        <TextArea label="Message" />
        <Select label="Topic">
          <option>Work</option>
          <option>Hello</option>
        </Select>
      </>,
    );
    expect(screen.getByLabelText('Message').tagName).toBe('TEXTAREA');
    expect(screen.getByLabelText('Topic').tagName).toBe('SELECT');
  });
});
