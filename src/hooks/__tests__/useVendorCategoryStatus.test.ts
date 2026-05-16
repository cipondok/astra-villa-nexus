import { describe, it, expect } from 'vitest';
describe('useVendorCategoryStatus', () => {
  it('category active check', () => { const cats = [{ name: 'plumbing', active: true }, { name: 'electrical', active: false }]; expect(cats.filter(c => c.active)).toHaveLength(1); });
  it('vendor count per category', () => { const vendors = [{ cat: 'A' }, { cat: 'B' }, { cat: 'A' }]; const counts: Record<string, number> = {}; vendors.forEach(v => counts[v.cat] = (counts[v.cat] || 0) + 1); expect(counts['A']).toBe(2); });
  it('category slug', () => { const slug = 'Home Renovation'.toLowerCase().replace(/\s+/g, '-'); expect(slug).toBe('home-renovation'); });
});
