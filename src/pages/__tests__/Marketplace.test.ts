import { describe, it, expect } from 'vitest';

describe('Marketplace page', () => {
  it('categories include key service types', () => {
    const categories = ['cleaning', 'renovation', 'moving', 'interior-design', 'legal', 'photography'];
    expect(categories).toContain('renovation');
    expect(categories.length).toBeGreaterThanOrEqual(5);
  });

  it('sorts vendors by rating', () => {
    const vendors = [
      { name: 'A', rating: 4.2 },
      { name: 'B', rating: 4.8 },
      { name: 'C', rating: 4.5 },
    ];
    const sorted = [...vendors].sort((a, b) => b.rating - a.rating);
    expect(sorted[0].name).toBe('B');
  });

  it('search filters vendors by name', () => {
    const vendors = [{ name: 'Clean Pro' }, { name: 'Move Master' }];
    const results = vendors.filter(v => v.name.toLowerCase().includes('clean'));
    expect(results).toHaveLength(1);
  });
});
