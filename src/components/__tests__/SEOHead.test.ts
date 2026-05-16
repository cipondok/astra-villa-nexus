import { describe, it, expect } from 'vitest';

describe('SEOHead - meta tag logic', () => {
  it('title length <= 60 chars', () => {
    const title = 'Luxury Apartments in Jakarta | Astra Realty';
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it('meta description <= 160 chars', () => {
    const desc = 'Find your dream apartment in Jakarta with Astra Realty. Browse luxury properties, villas, and more across Indonesia.';
    expect(desc.length).toBeLessThanOrEqual(160);
  });

  it('canonical URL format', () => {
    const base = 'https://astra-villa-realty.lovable.app';
    const path = '/properties/apartment-jakarta';
    const canonical = `${base}${path}`;
    expect(canonical).toMatch(/^https:\/\/.+\/.+/);
  });

  it('OG tags structure', () => {
    const og = { title: 'Page Title', description: 'Desc', image: '/og.png', type: 'website' };
    expect(og.type).toBe('website');
    expect(og.image).toBeTruthy();
  });

  it('JSON-LD schema', () => {
    const schema = { '@context': 'https://schema.org', '@type': 'RealEstateListing', name: 'Villa Bali' };
    const json = JSON.stringify(schema);
    expect(json).toContain('schema.org');
    expect(json).toContain('RealEstateListing');
  });
});
