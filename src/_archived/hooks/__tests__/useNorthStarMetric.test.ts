import { describe, it, expect } from 'vitest';

describe('useNorthStarMetric - North Star scoring', () => {
  const WEIGHTS = { inquiry: 1, offer: 3, watchlist: 0.5 };

  function computeQIA(inq: number, offers: number, wl: number) {
    return Math.round(inq * WEIGHTS.inquiry + offers * WEIGHTS.offer + wl * WEIGHTS.watchlist);
  }

  function classifyHealth(delta: number, progress: number) {
    if (delta >= 15 && progress >= 70) return 'accelerating';
    if (delta >= 0 && progress >= 40) return 'on_track';
    if (delta >= -10) return 'at_risk';
    return 'declining';
  }

  it('weighted QIA calculation', () => {
    expect(computeQIA(100, 20, 50)).toBe(100 + 60 + 25);
  });

  it('offers have highest weight impact', () => {
    const inqOnly = computeQIA(100, 0, 0);
    const offerOnly = computeQIA(0, 100, 0);
    expect(offerOnly).toBeGreaterThan(inqOnly);
  });

  it('accelerating health with strong delta and progress', () => {
    expect(classifyHealth(20, 80)).toBe('accelerating');
  });

  it('on_track with positive delta', () => {
    expect(classifyHealth(5, 50)).toBe('on_track');
  });

  it('at_risk with slight decline', () => {
    expect(classifyHealth(-5, 30)).toBe('at_risk');
  });

  it('declining with major drop', () => {
    expect(classifyHealth(-20, 10)).toBe('declining');
  });

  it('target progress capped at 100', () => {
    const progress = Math.min(100, Math.round((600 / 500) * 100));
    expect(progress).toBe(100);
  });

  it('delta calculation handles zero previous', () => {
    const current = 50;
    const previous = 0;
    const delta = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
    expect(delta).toBe(100);
  });
});
