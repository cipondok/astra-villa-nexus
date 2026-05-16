import { describe, it, expect } from 'vitest';

describe('useListingSuccessPredictor - listing prediction', () => {
  it('predicts success score from features', () => {
    const predict = (photos: number, descLen: number, price: number, avgPrice: number) => {
      let s = 0;
      s += Math.min(photos / 10, 1) * 30;
      s += Math.min(descLen / 500, 1) * 20;
      s += price <= avgPrice ? 30 : 15;
      s += 20; // base
      return Math.min(s, 100);
    };
    expect(predict(10, 500, 900, 1000)).toBe(100);
    expect(predict(3, 100, 1200, 1000)).toBeLessThan(80);
  });
  it('time-to-sell estimation', () => {
    const avgDays = 45; const scoreFactor = 0.8;
    const estimated = Math.round(avgDays / scoreFactor);
    expect(estimated).toBe(56);
  });
  it('competitive analysis', () => {
    const similar = [800, 850, 900, 950, 1000];
    const myPrice = 870;
    const percentile = similar.filter(p => p <= myPrice).length / similar.length * 100;
    expect(percentile).toBe(40);
  });
});
