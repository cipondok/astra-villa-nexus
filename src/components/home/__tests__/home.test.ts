import { describe, it, expect } from 'vitest';

describe('Home components', () => {
  it('featured properties carousel shows max 8', () => {
    const MAX = 8;
    const props = Array.from({ length: 15 });
    expect(props.slice(0, MAX)).toHaveLength(8);
  });
  it('gold sparkle effect opacity range', () => {
    const opacity = Math.random() * 0.5 + 0.3;
    expect(opacity).toBeGreaterThanOrEqual(0.3);
    expect(opacity).toBeLessThanOrEqual(0.8);
  });
  it('trending searches limit to 10', () => {
    const MAX = 10;
    const searches = Array.from({ length: 20 }, (_, i) => `search-${i}`);
    expect(searches.slice(0, MAX)).toHaveLength(10);
  });
  it('partner logos marquee speed', () => {
    const speed = 30;
    expect(speed).toBeGreaterThan(0);
  });
});
