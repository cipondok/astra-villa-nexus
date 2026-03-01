import { describe, it, expect } from 'vitest';

describe('Mortgage components', () => {
  it('calculates monthly PMT correctly', () => {
    const pmt = (principal: number, annualRate: number, years: number) => {
      const r = annualRate / 100 / 12;
      const n = years * 12;
      return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    };
    const monthly = pmt(1_600_000_000, 8.5, 20);
    expect(monthly).toBeGreaterThan(13_000_000);
    expect(monthly).toBeLessThan(15_000_000);
  });

  it('calculates total interest over loan term', () => {
    const monthly = 14_000_000;
    const years = 20;
    const principal = 1_600_000_000;
    const totalInterest = monthly * years * 12 - principal;
    expect(totalInterest).toBeGreaterThan(0);
  });

  it('scenario comparison identifies cheapest option', () => {
    const scenarios = [
      { bank: 'BCA', monthly: 14_200_000 },
      { bank: 'BRI', monthly: 13_800_000 },
      { bank: 'Mandiri', monthly: 14_500_000 },
    ];
    const cheapest = scenarios.reduce((a, b) => a.monthly < b.monthly ? a : b);
    expect(cheapest.bank).toBe('BRI');
  });
});
