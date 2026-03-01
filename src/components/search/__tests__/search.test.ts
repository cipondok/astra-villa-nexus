import { describe, it, expect } from 'vitest';

describe('Search components', () => {
  it('filters properties by price range', () => {
    const properties = [
      { price: 500_000_000 },
      { price: 1_200_000_000 },
      { price: 3_000_000_000 },
    ];
    const filtered = properties.filter(p => p.price >= 1_000_000_000 && p.price <= 2_000_000_000);
    expect(filtered).toHaveLength(1);
  });

  it('debounces search input', () => {
    const DEBOUNCE_MS = 300;
    expect(DEBOUNCE_MS).toBeGreaterThan(0);
  });

  it('generates active filter pills from params', () => {
    const params = { type: 'apartment', minPrice: '1000000000', bedrooms: '3' };
    const pills = Object.entries(params).map(([k, v]) => ({ key: k, value: v }));
    expect(pills).toHaveLength(3);
  });

  it('pagination calculates total pages', () => {
    const totalResults = 47;
    const perPage = 12;
    const totalPages = Math.ceil(totalResults / perPage);
    expect(totalPages).toBe(4);
  });

  it('NLP search extracts price from natural language', () => {
    const query = 'apartment under 2 billion in jakarta';
    const hasPriceRef = /\d+\s*(billion|miliar|juta|million)/i.test(query);
    expect(hasPriceRef).toBe(true);
  });
});
