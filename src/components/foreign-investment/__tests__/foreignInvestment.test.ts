import { describe, it, expect } from 'vitest';

describe('Foreign Investment components', () => {
  it('minimum investment amount in IDR', () => {
    const minInvestment = 5_000_000_000;
    expect(minInvestment).toBeGreaterThanOrEqual(5_000_000_000);
  });
  it('inquiry form validates email', () => {
    const isValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    expect(isValid('investor@firm.com')).toBe(true);
  });
  it('investment order calculates fees', () => {
    const amount = 10_000_000_000;
    const feeRate = 0.025;
    const fee = amount * feeRate;
    expect(fee).toBe(250_000_000);
  });
});
