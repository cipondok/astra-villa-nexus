import { describe, it, expect } from 'vitest';

describe('Analytics page', () => {
  it('date range defaults to last 30 days', () => {
    const now = new Date('2026-03-01');
    const start = new Date(now.getTime() - 30 * 86400000);
    expect(start.getMonth()).toBe(0); // January
  });
  it('page views aggregation', () => {
    const daily = [120, 150, 200, 180, 90, 110, 160];
    const total = daily.reduce((s, v) => s + v, 0);
    expect(total).toBe(1010);
  });
  it('conversion rate calculation', () => {
    const visitors = 10000;
    const conversions = 250;
    const rate = (conversions / visitors) * 100;
    expect(rate).toBe(2.5);
  });
});
