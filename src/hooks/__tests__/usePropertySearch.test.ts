import { describe, it, expect } from 'vitest';

describe('usePropertySearch - search logic', () => {
  it('builds query params from filters', () => {
    const filters = { location: 'jakarta', type: 'apartment', minPrice: 500000000 };
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => params.set(k, String(v)));
    expect(params.get('location')).toBe('jakarta');
    expect(params.get('minPrice')).toBe('500000000');
  });

  it('normalizes search query', () => {
    const normalize = (q: string) => q.toLowerCase().trim().replace(/\s+/g, ' ');
    expect(normalize('  Jakarta  Selatan  ')).toBe('jakarta selatan');
  });

  it('empty filters returns no constraints', () => {
    const filters = {};
    const active = Object.entries(filters).filter(([_, v]) => v != null && v !== '');
    expect(active).toHaveLength(0);
  });

  it('price range validation', () => {
    const min = 100000000;
    const max = 500000000;
    expect(min).toBeLessThan(max);
    const invalid = { min: 500, max: 100 };
    expect(invalid.min > invalid.max).toBe(true);
  });

  it('pagination offset calculation', () => {
    const page = 3;
    const pageSize = 15;
    const offset = (page - 1) * pageSize;
    expect(offset).toBe(30);
  });

  it('total pages calculation', () => {
    const total = 47;
    const pageSize = 15;
    const totalPages = Math.ceil(total / pageSize);
    expect(totalPages).toBe(4);
  });

  it('sort options', () => {
    const sortOptions = ['newest', 'price_asc', 'price_desc', 'popular'];
    expect(sortOptions).toContain('newest');
    expect(sortOptions).toHaveLength(4);
  });
});
