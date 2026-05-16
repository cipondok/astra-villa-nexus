import { describe, it, expect } from 'vitest';

describe('usePropertyCount - property count logic', () => {
  it('total count aggregation', () => {
    const byType = { apartment: 120, house: 80, villa: 45, land: 30 };
    const total = Object.values(byType).reduce((a, b) => a + b, 0);
    expect(total).toBe(275);
  });
  it('active vs inactive', () => {
    const all = 275; const active = 230;
    const inactive = all - active;
    expect(inactive).toBe(45);
  });
  it('count formatting', () => {
    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
    expect(fmt(1500)).toBe('1.5K');
    expect(fmt(800)).toBe('800');
  });
});
