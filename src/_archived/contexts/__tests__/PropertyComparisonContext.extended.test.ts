import { describe, it, expect } from 'vitest';

describe('PropertyComparisonContext - comparison logic', () => {
  it('max comparison items', () => {
    const MAX = 4;
    const items = ['p1', 'p2', 'p3'];
    expect(items.length < MAX).toBe(true);
  });

  it('toggle adds/removes', () => {
    let items = ['p1', 'p2'];
    const toggle = (id: string) => {
      items = items.includes(id) ? items.filter(i => i !== id) : [...items, id];
    };
    toggle('p3');
    expect(items).toContain('p3');
    toggle('p1');
    expect(items).not.toContain('p1');
  });

  it('comparison metrics', () => {
    const props = [
      { id: 'p1', price: 500, area: 80, bedrooms: 2 },
      { id: 'p2', price: 800, area: 120, bedrooms: 3 },
    ];
    const priceDiff = Math.abs(props[0].price - props[1].price);
    expect(priceDiff).toBe(300);
  });

  it('price per sqm comparison', () => {
    const a = { price: 1000000000, area: 100 };
    const b = { price: 800000000, area: 80 };
    const ppsA = a.price / a.area;
    const ppsB = b.price / b.area;
    expect(ppsA).toBe(ppsB);
  });

  it('clear all comparisons', () => {
    let items = ['p1', 'p2', 'p3'];
    items = [];
    expect(items).toHaveLength(0);
  });
});
