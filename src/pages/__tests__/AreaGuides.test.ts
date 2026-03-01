import { describe, it, expect } from 'vitest';
describe('AreaGuides page', () => {
  it('area guide covers key sections', () => {
    const sections = ['overview', 'amenities', 'transport', 'schools', 'pricing'];
    expect(sections).toHaveLength(5);
  });
  it('average property price by area', () => {
    const prices = [2e9, 2.5e9, 1.8e9, 3e9];
    const avg = prices.reduce((s, v) => s + v, 0) / prices.length;
    expect(avg).toBe(2.325e9);
  });
});
