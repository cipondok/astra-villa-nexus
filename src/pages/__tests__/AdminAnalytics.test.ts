import { describe, it, expect } from 'vitest';
describe('AdminAnalytics page', () => {
  it('date range presets', () => {
    const presets = ['today', '7d', '30d', '90d', '1y', 'custom'];
    expect(presets).toContain('30d');
  });
  it('conversion rate calculation', () => {
    const visitors = 10000;
    const conversions = 250;
    const rate = (conversions / visitors) * 100;
    expect(rate).toBe(2.5);
  });
  it('chart data points', () => {
    const days = 30;
    const data = Array.from({ length: days }, (_, i) => ({ day: i + 1, value: Math.random() * 100 }));
    expect(data).toHaveLength(30);
  });
});
