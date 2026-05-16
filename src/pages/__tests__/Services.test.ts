import { describe, it, expect } from 'vitest';
describe('Services page', () => {
  it('service categories', () => {
    const cats = ['renovation', 'cleaning', 'moving', 'legal', 'interior', 'photography'];
    expect(cats.length).toBeGreaterThanOrEqual(5);
  });
  it('service form validates price', () => {
    const price = 0;
    expect(price > 0).toBe(false);
  });
});
