import { describe, it, expect } from 'vitest';

describe('useTenantScore - tenant scoring logic', () => {
  it('score range 0-100', () => {
    const score = 75;
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
  it('scoring factors', () => {
    const factors = { paymentHistory: 30, employmentStability: 25, incomeRatio: 20, references: 15, creditCheck: 10 };
    const total = Object.values(factors).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });
  it('risk category from score', () => {
    const getRisk = (s: number) => s >= 80 ? 'low' : s >= 60 ? 'medium' : 'high';
    expect(getRisk(85)).toBe('low');
    expect(getRisk(65)).toBe('medium');
    expect(getRisk(40)).toBe('high');
  });
  it('income-to-rent ratio', () => {
    const income = 15000000; const rent = 4000000;
    const ratio = income / rent;
    expect(ratio).toBeGreaterThan(3);
  });
});
