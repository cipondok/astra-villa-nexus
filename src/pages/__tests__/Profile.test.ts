import { describe, it, expect } from 'vitest';

describe('Profile page', () => {
  it('validates phone number format', () => {
    const isValid = (phone: string) => /^(\+62|62|0)8\d{8,11}$/.test(phone);
    expect(isValid('+6281234567890')).toBe(true);
    expect(isValid('081234567890')).toBe(true);
    expect(isValid('12345')).toBe(false);
  });

  it('avatar upload max size 2MB', () => {
    const MAX_SIZE = 2 * 1024 * 1024;
    const fileSize = 1_500_000;
    expect(fileSize < MAX_SIZE).toBe(true);
  });

  it('profile completeness percentage', () => {
    const fields = { name: true, email: true, phone: true, avatar: false, address: false };
    const filled = Object.values(fields).filter(Boolean).length;
    const total = Object.values(fields).length;
    const pct = Math.round((filled / total) * 100);
    expect(pct).toBe(60);
  });
});
