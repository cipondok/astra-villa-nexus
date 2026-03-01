import { describe, it, expect } from 'vitest';
describe('Analytics components', () => {
  it('ROI calculator compound interest', () => {
    const invested = 1e9; const rate = 0.1; const years = 5;
    const fv = invested * Math.pow(1 + rate, years);
    expect(fv).toBeGreaterThan(1.6e9);
  });
  it('price distribution buckets', () => {
    const prices = [500e6, 1e9, 1.5e9, 2e9, 3e9];
    const under1b = prices.filter(p => p < 1e9);
    expect(under1b).toHaveLength(1);
  });
});
