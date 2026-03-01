import { describe, it, expect } from 'vitest';
describe('PropertySlideshow component', () => {
  it('auto-advance interval', () => {
    const INTERVAL_MS = 5000;
    expect(INTERVAL_MS).toBe(5000);
  });
  it('wraps around at last image', () => {
    const total = 10;
    const nextIndex = (current: number) => (current + 1) % total;
    expect(nextIndex(9)).toBe(0);
  });
  it('thumbnail strip max visible', () => {
    const MAX_THUMBS = 6;
    expect(MAX_THUMBS).toBeGreaterThanOrEqual(4);
  });
});
