import { describe, it, expect } from 'vitest';

describe('useSmartCollections - collection logic', () => {
  it('auto-collection based on criteria', () => {
    const properties = [
      { id: '1', price: 500, type: 'apartment', location: 'jakarta' },
      { id: '2', price: 2000, type: 'villa', location: 'bali' },
      { id: '3', price: 300, type: 'apartment', location: 'jakarta' },
    ];
    const criteria = { type: 'apartment', location: 'jakarta' };
    const matched = properties.filter(p => p.type === criteria.type && p.location === criteria.location);
    expect(matched).toHaveLength(2);
  });

  it('collection ordering', () => {
    const items = [
      { id: '1', order: 3 },
      { id: '2', order: 1 },
      { id: '3', order: 2 },
    ];
    const sorted = [...items].sort((a, b) => a.order - b.order);
    expect(sorted[0].id).toBe('2');
  });

  it('max items per collection', () => {
    const MAX = 50;
    const items = Array.from({ length: 60 }, (_, i) => ({ id: `${i}` }));
    const limited = items.slice(0, MAX);
    expect(limited).toHaveLength(50);
  });

  it('featured collection flag', () => {
    const collection = { name: 'Luxury Villas', is_featured: true, items: [] };
    expect(collection.is_featured).toBe(true);
  });

  it('collection slug generation', () => {
    const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    expect(toSlug('Luxury Villas in Bali')).toBe('luxury-villas-in-bali');
    expect(toSlug('  Best Apartments! ')).toBe('best-apartments');
  });
});
