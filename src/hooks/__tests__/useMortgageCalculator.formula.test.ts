import { describe, it, expect } from 'vitest';
import { calculateMortgage } from '../useMortgageCalculator';
import type { CalculationInput } from '../useMortgageCalculator';

describe('calculateMortgage - PMT formula', () => {
  const baseInput: CalculationInput = {
    propertyPrice: 1_000_000_000,
    downPayment: 200_000_000,
    loanTermYears: 20,
    interestRate: 8,
  };

  it('calculates correct loan amount', () => {
    const result = calculateMortgage(baseInput);
    expect(result.loanAmount).toBe(800_000_000);
  });

  it('monthly payment is positive', () => {
    const result = calculateMortgage(baseInput);
    expect(result.monthlyPayment).toBeGreaterThan(0);
  });

  it('total payment exceeds loan amount (with interest)', () => {
    const result = calculateMortgage(baseInput);
    expect(result.totalPayment).toBeGreaterThan(result.loanAmount);
  });

  it('total interest = total payment - loan amount', () => {
    const result = calculateMortgage(baseInput);
    expect(result.totalInterest).toBeCloseTo(result.totalPayment - result.loanAmount, 0);
  });

  it('handles 0% interest rate', () => {
    const result = calculateMortgage({ ...baseInput, interestRate: 0 });
    const expected = 800_000_000 / (20 * 12);
    expect(result.monthlyPayment).toBeCloseTo(expected, 0);
  });

  it('down payment percent calculated correctly', () => {
    const result = calculateMortgage(baseInput);
    expect(result.downPaymentPercent).toBeCloseTo(20, 0);
  });

  it('affordability ratio calculated when income provided', () => {
    const result = calculateMortgage({ ...baseInput, monthlyIncome: 20_000_000 });
    expect(result.affordabilityRatio).toBeDefined();
    expect(result.affordabilityRatio!).toBeGreaterThan(0);
  });
});
