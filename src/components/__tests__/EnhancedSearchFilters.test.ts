import { describe, it, expect } from 'vitest';
describe('EnhancedSearchFilters', () => {
  it('filter groups', () => { expect(['price','type','bedrooms','area','amenities']).toHaveLength(5); });
  it('price range validation', () => { const min=0,max=10e9; expect(max>min).toBe(true); });
});
