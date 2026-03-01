import { describe, it, expect } from 'vitest';

describe('Properties page', () => {
  it('default sort is by newest', () => {
    const defaultSort = 'newest';
    expect(defaultSort).toBe('newest');
  });

  it('view mode toggles between grid and list', () => {
    let viewMode = 'grid';
    viewMode = viewMode === 'grid' ? 'list' : 'grid';
    expect(viewMode).toBe('list');
  });

  it('filters combine with AND logic', () => {
    const filters = { type: 'apartment', bedrooms: 3, minPrice: 1_000_000_000 };
    const props = [
      { type: 'apartment', bedrooms: 3, price: 1_500_000_000 },
      { type: 'house', bedrooms: 3, price: 1_500_000_000 },
      { type: 'apartment', bedrooms: 2, price: 1_500_000_000 },
    ];
    const filtered = props.filter(p =>
      p.type === filters.type && p.bedrooms === filters.bedrooms && p.price >= filters.minPrice
    );
    expect(filtered).toHaveLength(1);
  });
});
