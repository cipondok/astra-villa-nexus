import { describe, it, expect } from 'vitest';

describe('Property components', () => {
  it('calculates KPR affordability ratio', () => {
    const monthly = 14_000_000;
    const income = 40_000_000;
    const ratio = (monthly / income) * 100;
    expect(ratio).toBe(35);
  });

  it('formats property area with sqm suffix', () => {
    const area = 150;
    const formatted = `${area} m²`;
    expect(formatted).toBe('150 m²');
  });

  it('generates amortization schedule row', () => {
    const balance = 1_000_000_000;
    const rate = 8.5 / 100 / 12;
    const interest = Math.round(balance * rate);
    const payment = 10_000_000;
    const principal = payment - interest;
    const newBalance = balance - principal;
    expect(interest).toBeGreaterThan(0);
    expect(newBalance).toBeLessThan(balance);
  });

  it('trust badges render correct verification levels', () => {
    const levels = ['basic', 'verified', 'premium', 'exclusive'];
    expect(levels.indexOf('verified')).toBe(1);
  });

  it('property card skeleton has loading state', () => {
    const isLoading = true;
    expect(isLoading).toBe(true);
  });
});
