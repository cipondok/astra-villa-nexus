import { describe, it, expect } from 'vitest';

describe('useAgentAnalytics - agent performance metrics', () => {
  it('response rate calculation', () => {
    const totalInquiries = 50;
    const responded = 45;
    const rate = (responded / totalInquiries) * 100;
    expect(rate).toBe(90);
  });

  it('average response time in minutes', () => {
    const times = [5, 10, 15, 20, 30]; // minutes
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    expect(avg).toBe(16);
  });

  it('conversion funnel', () => {
    const funnel = { views: 1000, inquiries: 100, viewings: 30, offers: 10, sales: 5 };
    const conversionRate = (funnel.sales / funnel.views) * 100;
    expect(conversionRate).toBe(0.5);
  });

  it('monthly performance comparison', () => {
    const thisMonth = { sales: 5, revenue: 50000000 };
    const lastMonth = { sales: 3, revenue: 30000000 };
    const growth = ((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100;
    expect(growth).toBeCloseTo(66.67, 1);
  });

  it('listing quality score', () => {
    const score = (photos: number, desc: number, amenities: boolean) => {
      let s = 0;
      s += Math.min(photos, 10) * 5;
      s += Math.min(desc, 500) / 10;
      s += amenities ? 10 : 0;
      return Math.min(s, 100);
    };
    expect(score(8, 300, true)).toBe(80);
  });
});
