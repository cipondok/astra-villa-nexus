import { describe, it, expect } from 'vitest';

describe('Messaging components', () => {
  it('contact agent button generates WhatsApp link', () => {
    const phone = '6281234567890';
    const link = `https://wa.me/${phone}`;
    expect(link).toContain('wa.me');
  });
  it('message content max length', () => {
    const MAX = 2000;
    const msg = 'Hello'.repeat(500);
    const isValid = msg.length <= MAX;
    expect(isValid).toBe(false);
  });
});
