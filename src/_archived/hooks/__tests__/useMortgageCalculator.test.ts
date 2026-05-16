import { describe, it, expect } from 'vitest';
import { calculateMortgage } from '../useMortgageCalculator';

describe('calculateMortgage', () => {
  const baseInput = {
    propertyPrice: 1_000_000_000,
    downPayment: 200_000_000,
    loanTermYears: 20,
    interestRate: 8,
  };

  it('calculates correct loan amount', () => {
    const result = calculateMortgage(baseInput);
    expect(result.loanAmount).toBe(800_000_000);
  });

  it('calculates correct down payment percent', () => {
    const result = calculateMortgage(baseInput);
    expect(result.downPaymentPercent).toBeCloseTo(20);
  });

  it('calculates monthly payment with PMT formula', () => {
    const result = calculateMortgage(baseInput);
    // 800M at 8% for 20 years ≈ 6,691,xxx/month
    expect(result.monthlyPayment).toBeGreaterThan(6_000_000);
    expect(result.monthlyPayment).toBeLessThan(7_500_000);
  });

  it('total payment exceeds loan amount (due to interest)', () => {
    const result = calculateMortgage(baseInput);
    expect(result.totalPayment).toBeGreaterThan(result.loanAmount);
  });

  it('totalInterest = totalPayment - loanAmount', () => {
    const result = calculateMortgage(baseInput);
    expect(result.totalInterest).toBeCloseTo(result.totalPayment - result.loanAmount, 0);
  });

  it('handles 0% interest rate', () => {
    const result = calculateMortgage({ ...baseInput, interestRate: 0 });
    const expected = 800_000_000 / (20 * 12);
    expect(result.monthlyPayment).toBeCloseTo(expected);
    expect(result.totalInterest).toBeCloseTo(0);
  });

  it('generates correct number of monthly breakdowns', () => {
    const result = calculateMortgage(baseInput);
    expect(result.monthlyBreakdown).toHaveLength(20 * 12);
  });

  it('generates correct number of yearly breakdowns', () => {
    const result = calculateMortgage(baseInput);
    expect(result.yearlyBreakdown).toHaveLength(20);
  });

  it('final monthly balance is approximately 0', () => {
    const result = calculateMortgage(baseInput);
    const lastMonth = result.monthlyBreakdown[result.monthlyBreakdown.length - 1];
    expect(lastMonth.balance).toBeCloseTo(0, 0);
  });

  it('calculates affordability ratio when income provided', () => {
    const result = calculateMortgage({ ...baseInput, monthlyIncome: 20_000_000 });
    expect(result.affordabilityRatio).toBeDefined();
    expect(result.affordabilityRatio!).toBeGreaterThan(0);
    expect(result.affordabilityRatio!).toBeLessThan(100);
  });

  it('affordabilityRatio is undefined when no income', () => {
    const result = calculateMortgage(baseInput);
    expect(result.affordabilityRatio).toBeUndefined();
  });

  it('yearly breakdown last entry has ~0 remaining balance', () => {
    const result = calculateMortgage(baseInput);
    const lastYear = result.yearlyBreakdown[result.yearlyBreakdown.length - 1];
    expect(lastYear.remainingBalance).toBeCloseTo(0, 0);
  });
});
