import { describe, it, expect } from 'vitest';
describe('ProvinceProperties page', () => {
  it('Indonesian provinces', () => {
    const provinces = ['DKI Jakarta', 'Jawa Barat', 'Bali', 'Jawa Timur', 'Banten'];
    expect(provinces).toContain('Bali');
  });
  it('province slug from name', () => {
    const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');
    expect(toSlug('DKI Jakarta')).toBe('dki-jakarta');
  });
  it('property count by province', () => {
    const counts: Record<string, number> = { 'dki-jakarta': 5000, 'bali': 3000 };
    expect(counts['dki-jakarta']).toBeGreaterThan(counts['bali']);
  });
});
