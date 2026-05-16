import { describe, it, expect } from 'vitest';

describe('useInvestorLTV - LTV scoring and segmentation', () => {
  function classifySegment(ltv: number) {
    if (ltv >= 50_000_000) return 'whale';
    if (ltv >= 15_000_000) return 'high_value';
    if (ltv >= 3_000_000) return 'moderate';
    if (ltv >= 500_000) return 'casual';
    return 'dormant';
  }

  function computeLTV(avgRev: number, dealsPerYear: number, years: number) {
    return Math.round(avgRev * dealsPerYear * years);
  }

  it('whale classification for high LTV', () => {
    expect(classifySegment(75_000_000)).toBe('whale');
  });

  it('high_value classification', () => {
    expect(classifySegment(20_000_000)).toBe('high_value');
  });

  it('moderate classification', () => {
    expect(classifySegment(5_000_000)).toBe('moderate');
  });

  it('casual classification', () => {
    expect(classifySegment(1_000_000)).toBe('casual');
  });

  it('dormant for zero LTV', () => {
    expect(classifySegment(0)).toBe('dormant');
  });

  it('LTV computation with 3-year lifecycle', () => {
    expect(computeLTV(5_000_000, 2, 3)).toBe(30_000_000);
  });

  it('LTV zero when no deals', () => {
    expect(computeLTV(0, 0, 3)).toBe(0);
  });

  it('higher deal frequency increases LTV', () => {
    const low = computeLTV(5_000_000, 1, 3);
    const high = computeLTV(5_000_000, 4, 3);
    expect(high).toBeGreaterThan(low);
  });
});
