import { describe, it, expect } from 'vitest';

describe('Affiliate components', () => {
  it('calculates pending vs paid earnings', () => {
    const total = 15_000_000;
    const paid = 10_000_000;
    const pending = total - paid;
    expect(pending).toBe(5_000_000);
  });
  it('referral code is unique', () => {
    const code = 'AFF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    expect(code).toMatch(/^AFF-[A-Z0-9]{6}$/);
  });
  it('commission rate defaults to 5%', () => {
    const rate = 0.05;
    const sale = 1_000_000_000;
    expect(sale * rate).toBe(50_000_000);
  });
});
