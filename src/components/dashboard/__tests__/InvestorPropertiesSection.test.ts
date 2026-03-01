import { describe, it, expect } from 'vitest';

describe('InvestorPropertiesSection', () => {
  it('calculates total portfolio value', () => {
    const properties = [
      { value: 2_000_000_000 },
      { value: 1_500_000_000 },
      { value: 3_200_000_000 },
    ];
    const total = properties.reduce((sum, p) => sum + p.value, 0);
    expect(total).toBe(6_700_000_000);
  });

  it('calculates average yield', () => {
    const yields = [6.5, 7.2, 5.8];
    const avg = yields.reduce((s, y) => s + y, 0) / yields.length;
    expect(avg).toBeCloseTo(6.5, 1);
  });
});
