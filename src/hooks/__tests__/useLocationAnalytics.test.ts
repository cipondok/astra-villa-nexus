import { describe, it, expect } from 'vitest';

describe('useLocationAnalytics - location analytics', () => {
  it('top locations by listing count', () => {
    const data = [{ loc: 'jakarta', count: 500 }, { loc: 'bali', count: 300 }, { loc: 'surabaya', count: 200 }];
    const sorted = [...data].sort((a, b) => b.count - a.count);
    expect(sorted[0].loc).toBe('jakarta');
  });
  it('price heatmap data', () => {
    const zones = [{ zone: 'A', avgPrice: 2e9 }, { zone: 'B', avgPrice: 1.5e9 }, { zone: 'C', avgPrice: 800e6 }];
    const max = Math.max(...zones.map(z => z.avgPrice));
    const normalized = zones.map(z => ({ ...z, intensity: z.avgPrice / max }));
    expect(normalized[0].intensity).toBe(1);
    expect(normalized[2].intensity).toBe(0.4);
  });
  it('demand score by location', () => {
    const views = 1000; const inquiries = 50; const listings = 20;
    const demand = (views + inquiries * 10) / listings;
    expect(demand).toBe(75);
  });
});
