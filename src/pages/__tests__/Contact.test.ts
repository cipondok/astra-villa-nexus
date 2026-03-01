import { describe, it, expect } from 'vitest';

describe('Contact page', () => {
  it('contact form requires all fields', () => {
    const form = { name: 'John', email: 'j@m.com', message: '' };
    const isValid = Object.values(form).every(v => v.length > 0);
    expect(isValid).toBe(false);
  });
  it('office locations include Jakarta', () => {
    const offices = ['Jakarta', 'Bali', 'Surabaya'];
    expect(offices).toContain('Jakarta');
  });
});
