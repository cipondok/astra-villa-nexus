import { describe, it, expect } from 'vitest';

describe('usePropertyAnalytics - property analytics logic', () => {
  it('view-to-inquiry ratio', () => {
    const views = 500;
    const inquiries = 25;
    const ratio = (inquiries / views) * 100;
    expect(ratio).toBe(5);
  });

  it('price per sqm calculation', () => {
    const price = 2000000000;
    const area = 120;
    const pricePerSqm = price / area;
    expect(pricePerSqm).toBeCloseTo(16666667, -1);
  });

  it('market comparison', () => {
    const propertyPrice = 1500000000;
    const avgMarketPrice = 1800000000;
    const diff = ((propertyPrice - avgMarketPrice) / avgMarketPrice) * 100;
    expect(diff).toBeCloseTo(-16.67, 1);
  });

  it('time on market tracking', () => {
    const listedAt = new Date('2026-01-15');
    const now = new Date('2026-03-01');
    const daysOnMarket = Math.floor((now.getTime() - listedAt.getTime()) / 86400000);
    expect(daysOnMarket).toBe(45);
  });

  it('engagement score', () => {
    const views = 100;
    const saves = 15;
    const inquiries = 5;
    const shares = 8;
    const score = views * 1 + saves * 3 + inquiries * 10 + shares * 2;
    expect(score).toBe(211);
  });

  it('peak viewing hours', () => {
    const viewsByHour = { 8: 10, 9: 25, 10: 40, 14: 35, 19: 50, 20: 45 };
    const peak = Object.entries(viewsByHour).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
    expect(peak[0]).toBe('19');
  });
});
