import { describe, it, expect } from 'vitest';

describe('Investment page', () => {
  it('calculates projected ROI', () => {
    const invested = 1_000_000_000;
    const annualReturn = 0.12;
    const years = 5;
    const projected = invested * Math.pow(1 + annualReturn, years);
    expect(projected).toBeGreaterThan(1_700_000_000);
  });

  it('risk levels categorized correctly', () => {
    const riskLevel = (returnRate: number) => {
      if (returnRate < 5) return 'low';
      if (returnRate < 12) return 'medium';
      return 'high';
    };
    expect(riskLevel(3)).toBe('low');
    expect(riskLevel(8)).toBe('medium');
    expect(riskLevel(15)).toBe('high');
  });
});
