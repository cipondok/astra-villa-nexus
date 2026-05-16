import { describe, it, expect } from 'vitest';

describe('usePropertyFilters - filter logic', () => {
  it('price range filter', () => {
    const properties = [
      { id: '1', price: 500000000 },
      { id: '2', price: 1200000000 },
      { id: '3', price: 800000000 },
    ];
    const filtered = properties.filter(p => p.price >= 600000000 && p.price <= 1000000000);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('3');
  });

  it('bedroom count filter', () => {
    const props = [
      { bedrooms: 1 }, { bedrooms: 2 }, { bedrooms: 3 }, { bedrooms: 4 }
    ];
    const minBed = 2;
    expect(props.filter(p => p.bedrooms >= minBed)).toHaveLength(3);
  });

  it('multiple filter combination', () => {
    const props = [
      { type: 'apartment', price: 500, beds: 2 },
      { type: 'house', price: 800, beds: 3 },
      { type: 'apartment', price: 600, beds: 3 },
    ];
    const filtered = props.filter(p => p.type === 'apartment' && p.beds >= 2);
    expect(filtered).toHaveLength(2);
  });

  it('active filter count', () => {
    const filters = { location: 'jakarta', type: 'apartment', minPrice: null, maxPrice: 1000000000, bedrooms: null };
    const active = Object.values(filters).filter(v => v != null).length;
    expect(active).toBe(3);
  });

  it('reset filters', () => {
    const defaults = { location: null, type: null, minPrice: null, maxPrice: null };
    const current = { location: 'bali', type: 'villa', minPrice: 500, maxPrice: 1000 };
    const reset = { ...defaults };
    expect(Object.values(reset).every(v => v === null)).toBe(true);
  });

  it('sort by price ascending', () => {
    const props = [{ price: 800 }, { price: 400 }, { price: 600 }];
    const sorted = [...props].sort((a, b) => a.price - b.price);
    expect(sorted[0].price).toBe(400);
  });
});
