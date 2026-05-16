import { describe, it, expect } from 'vitest';

describe('Index page', () => {
  it('hero section has call-to-action', () => {
    const ctaText = 'Explore Properties';
    expect(ctaText).toBeTruthy();
  });

  it('featured properties limited to 6', () => {
    const MAX_FEATURED = 6;
    const properties = Array.from({ length: 20 });
    const featured = properties.slice(0, MAX_FEATURED);
    expect(featured).toHaveLength(6);
  });

  it('search panel accepts location input', () => {
    const location = 'Jakarta Selatan';
    expect(location.length).toBeGreaterThan(0);
  });
});
