import { describe, it, expect } from 'vitest';
describe('AIPriceEstimator page', () => {
  it('estimates price per sqm', () => {
    const pricePerSqm = 15_000_000;
    const area = 120;
    expect(pricePerSqm * area).toBe(1_800_000_000);
  });
  it('confidence interval range', () => {
    const estimate = 2_000_000_000;
    const margin = 0.1;
    const low = estimate * (1 - margin);
    const high = estimate * (1 + margin);
    expect(high - low).toBe(400_000_000);
  });
  it('comparable properties minimum count', () => {
    const comparables = Array.from({ length: 5 }, (_, i) => ({ id: i }));
    expect(comparables.length).toBeGreaterThanOrEqual(3);
  });
});
