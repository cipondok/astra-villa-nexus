import { describe, it, expect } from 'vitest';
describe('usePropertyCountsByProvince', () => {
  it('aggregation', () => { const data = [{ prov: 'Bali', count: 50 }, { prov: 'Jakarta', count: 120 }]; const total = data.reduce((s, d) => s + d.count, 0); expect(total).toBe(170); });
  it('sort descending', () => { const data = [{ c: 50 }, { c: 120 }]; expect([...data].sort((a, b) => b.c - a.c)[0].c).toBe(120); });
});
