import { describe, it, expect } from 'vitest';

describe('Membership components', () => {
  it('tier ordering from free to premium', () => {
    const tiers = ['free', 'basic', 'pro', 'premium'];
    expect(tiers[0]).toBe('free');
    expect(tiers[3]).toBe('premium');
  });

  it('calculates annual savings vs monthly', () => {
    const monthly = 199_000;
    const annual = 1_990_000;
    const monthlyTotal = monthly * 12;
    const savings = monthlyTotal - annual;
    expect(savings).toBe(398_000);
  });

  it('feature access by tier', () => {
    const features: Record<string, string[]> = {
      free: ['search', 'view'],
      pro: ['search', 'view', 'save', 'compare', 'alerts'],
    };
    expect(features.pro.length).toBeGreaterThan(features.free.length);
  });
});
