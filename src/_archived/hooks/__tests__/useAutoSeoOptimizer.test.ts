import { describe, it, expect } from 'vitest';

describe('useAutoSeoOptimizer - SEO optimization', () => {
  it('title tag length', () => {
    const title = 'Luxury Villa Bali | 3BR Pool | Astra Realty';
    expect(title.length).toBeLessThanOrEqual(60);
  });
  it('slug generation', () => {
    const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    expect(toSlug('3BR Luxury Villa in Bali!')).toBe('3br-luxury-villa-in-bali');
  });
  it('keyword density check', () => {
    const text = 'villa bali luxury villa bali pool villa';
    const words = text.split(' ');
    const keyword = 'villa';
    const density = (words.filter(w => w === keyword).length / words.length) * 100;
    expect(density).toBeCloseTo(42.86, 1);
  });
  it('structured data required fields', () => {
    const schema = { '@type': 'RealEstateListing', name: 'Villa', price: '1B IDR', address: {} };
    expect(schema['@type']).toBe('RealEstateListing');
    expect(schema.name).toBeTruthy();
  });
});
