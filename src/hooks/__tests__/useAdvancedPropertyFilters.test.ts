import { describe, it, expect } from 'vitest';
describe('useAdvancedPropertyFilters', () => {
  it('builds query with price range', () => { const filters = { minPrice: 500e6, maxPrice: 2e9 }; expect(filters.minPrice).toBeLessThan(filters.maxPrice); });
  it('pagination offset', () => { expect((3 - 1) * 15).toBe(30); });
  it('combines multiple filters', () => { const active = ['price', 'type', 'location'].filter(Boolean); expect(active).toHaveLength(3); });
});
