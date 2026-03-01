import { describe, it, expect } from 'vitest';

describe('Investment components', () => {
  it('cap rate calculation', () => {
    const noi = 120_000_000;
    const value = 2_000_000_000;
    const capRate = (noi / value) * 100;
    expect(capRate).toBe(6);
  });
  it('cash-on-cash return', () => {
    const annualCashFlow = 80_000_000;
    const totalInvested = 500_000_000;
    const coc = (annualCashFlow / totalInvested) * 100;
    expect(coc).toBe(16);
  });
});
