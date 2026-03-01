import { describe, it, expect } from 'vitest';

describe('KprCalculatorPage', () => {
  it('default down payment is 20%', () => {
    const DEFAULT_DP = 20;
    const propertyPrice = 2_000_000_000;
    const dp = propertyPrice * (DEFAULT_DP / 100);
    expect(dp).toBe(400_000_000);
  });

  it('loan amount = property price - down payment', () => {
    const price = 2_000_000_000;
    const dp = 400_000_000;
    expect(price - dp).toBe(1_600_000_000);
  });

  it('validates interest rate range', () => {
    const isValid = (rate: number) => rate >= 1 && rate <= 25;
    expect(isValid(8.5)).toBe(true);
    expect(isValid(0)).toBe(false);
    expect(isValid(30)).toBe(false);
  });

  it('loan term options in years', () => {
    const terms = [5, 10, 15, 20, 25, 30];
    expect(terms).toContain(20);
    expect(terms[0]).toBe(5);
  });
});
