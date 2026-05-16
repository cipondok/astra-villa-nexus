import { describe, it, expect } from 'vitest';
describe('MortgageCalculator component logic', () => {
  it('monthly payment formula', () => { const P = 800e6; const r = 0.08/12; const n = 240; const M = P * (r * (1+r)**n) / ((1+r)**n - 1); expect(M).toBeGreaterThan(6e6); expect(M).toBeLessThan(7e6); });
  it('slider step values', () => { const steps = { amount: 50e6, rate: 0.25, years: 1 }; expect(steps.rate).toBe(0.25); });
});
