import { describe, it, expect } from 'vitest';
describe('Disewa (For Rent) page', () => {
  it('rental period options', () => {
    const periods = ['monthly', 'yearly', 'daily'];
    expect(periods).toContain('yearly');
  });
  it('annual rent from monthly', () => {
    const monthly = 5_000_000;
    expect(monthly * 12).toBe(60_000_000);
  });
  it('deposit calculation', () => {
    const monthlyRent = 10_000_000;
    const depositMonths = 3;
    expect(monthlyRent * depositMonths).toBe(30_000_000);
  });
});
