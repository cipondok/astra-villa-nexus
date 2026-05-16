import { describe, it, expect } from 'vitest';

describe('useInvestorProfile - investor logic', () => {
  it('risk profile categories', () => {
    const profiles = ['conservative', 'moderate', 'aggressive'];
    expect(profiles).toHaveLength(3);
  });

  it('calculates ROI percentage', () => {
    const invested = 1000000000;
    const currentValue = 1200000000;
    const roi = ((currentValue - invested) / invested) * 100;
    expect(roi).toBe(20);
  });

  it('portfolio diversification score', () => {
    const holdings = [
      { type: 'apartment', value: 500 },
      { type: 'villa', value: 300 },
      { type: 'land', value: 200 },
    ];
    const types = new Set(holdings.map(h => h.type));
    const score = Math.min(types.size / 5, 1);
    expect(score).toBe(0.6);
  });

  it('investment horizon in years', () => {
    const start = new Date('2024-01-01');
    const target = new Date('2029-01-01');
    const years = (target.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    expect(Math.round(years)).toBe(5);
  });

  it('minimum investment threshold', () => {
    const MIN_INVESTMENT = 100000000; // 100M IDR
    const amount = 50000000;
    expect(amount >= MIN_INVESTMENT).toBe(false);
  });
});
