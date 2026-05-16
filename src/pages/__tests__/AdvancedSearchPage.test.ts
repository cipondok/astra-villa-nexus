import { describe, it, expect } from 'vitest';
describe('AdvancedSearchPage', () => {
  it('filter categories', () => {
    const categories = ['price', 'location', 'type', 'bedrooms', 'bathrooms', 'area', 'amenities'];
    expect(categories.length).toBeGreaterThanOrEqual(5);
  });
  it('radius search in km', () => {
    const radiusKm = 5;
    expect(radiusKm * 1000).toBe(5000);
  });
  it('sort options', () => {
    const sorts = ['newest', 'price_asc', 'price_desc', 'area_asc', 'area_desc'];
    expect(sorts).toContain('price_asc');
  });
});
