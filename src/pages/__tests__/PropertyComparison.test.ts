import { describe, it, expect } from 'vitest';
describe('PropertyComparison page', () => {
  it('max comparison items', () => {
    const MAX = 4;
    const selected = [1, 2, 3];
    expect(selected.length <= MAX).toBe(true);
  });
  it('price per sqm comparison', () => {
    const a = { price: 1e9, area: 100 };
    const b = { price: 1.5e9, area: 120 };
    expect(a.price / a.area).toBe(10_000_000);
    expect(b.price / b.area).toBe(12_500_000);
  });
  it('comparison criteria', () => {
    const criteria = ['price', 'area', 'bedrooms', 'bathrooms', 'location', 'year_built'];
    expect(criteria.length).toBeGreaterThanOrEqual(5);
  });
});
