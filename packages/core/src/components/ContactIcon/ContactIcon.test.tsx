import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { brandOf, contactKind, groupContacts } from '../../utils/contact';
import { ContactIcon } from './ContactIcon';

describe('contact lines', () => {
  it('tells emails, phones and links apart, and knows the famous sites', () => {
    expect(contactKind('mailto:me@example.com')).toEqual({ type: 'email' });
    expect(contactKind('tel:+639150000000')).toEqual({ type: 'phone' });
    expect(brandOf('https://github.com/example')?.name).toBe('GitHub');
    expect(brandOf('www.linkedin.com/in/example')?.name).toBe('LinkedIn');
    expect(brandOf('https://twitter.com/example')?.name).toBe('X');
    expect(brandOf('https://someone.substack.com')?.name).toBe('Substack');
    expect(brandOf('https://example.com')).toBeNull();
    expect(brandOf('https://notgithub.com')).toBeNull();
  });

  it('groups emails, then phones, then links, each in its own order', () => {
    const lines = [{ href: 'https://github.com/a' }, { href: 'mailto:b@x' }, { href: 'tel:1' }, { href: 'https://example.com' }, { href: 'mailto:a@x' }];
    expect(groupContacts(lines).map((l) => l.href)).toEqual(['mailto:b@x', 'mailto:a@x', 'tel:1', 'https://github.com/a', 'https://example.com']);
  });

  it('draws a mark for a known site and a globe for any other', () => {
    const brand = render(<ContactIcon href="https://github.com/a" />).container.querySelector('svg path')?.getAttribute('d');
    const other = render(<ContactIcon href="https://example.com" />).container.querySelector('svg');
    expect(brand?.length).toBeGreaterThan(50);
    expect(other?.getAttribute('class')).toMatch(/lucide-globe/);
    expect(render(<ContactIcon href="https://linkedin.com/in/a" />).container.querySelector('svg rect')).not.toBeNull();
  });
});
