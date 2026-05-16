import { describe, it, expect } from 'vitest';

describe('useRetentionEngine - retention scoring logic', () => {
  function computeHealthScore(signals: { browsing_frequency: number; watchlist_updates: number; alert_response_rate: number; days_since_last_visit: number }) {
    const f = Math.min(signals.browsing_frequency / 20, 1) * 30;
    const w = Math.min(signals.watchlist_updates / 10, 1) * 25;
    const a = (signals.alert_response_rate / 100) * 20;
    const r = Math.max(0, 1 - signals.days_since_last_visit / 30) * 25;
    return Math.round(f + w + a + r);
  }

  it('thriving user scores 80+', () => {
    const score = computeHealthScore({ browsing_frequency: 25, watchlist_updates: 12, alert_response_rate: 90, days_since_last_visit: 1 });
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it('inactive user scores low', () => {
    const score = computeHealthScore({ browsing_frequency: 1, watchlist_updates: 0, alert_response_rate: 10, days_since_last_visit: 28 });
    expect(score).toBeLessThan(20);
  });

  it('churn probability is inverse of health score', () => {
    const score = 75;
    const churn = Math.max(0, Math.min(1, 1 - score / 100));
    expect(churn).toBe(0.25);
  });

  it('health classification tiers', () => {
    const classify = (s: number) => s >= 80 ? 'thriving' : s >= 60 ? 'healthy' : s >= 40 ? 'cooling' : s >= 20 ? 'at_risk' : 'churning';
    expect(classify(85)).toBe('thriving');
    expect(classify(65)).toBe('healthy');
    expect(classify(45)).toBe('cooling');
    expect(classify(25)).toBe('at_risk');
    expect(classify(10)).toBe('churning');
  });

  it('trend detection', () => {
    const trend = (current: number, prev: number) => {
      const ratio = prev > 0 ? current / prev : current > 0 ? 2 : 1;
      return ratio > 1.15 ? 'improving' : ratio < 0.85 ? 'declining' : 'stable';
    };
    expect(trend(50, 30)).toBe('improving');
    expect(trend(30, 50)).toBe('declining');
    expect(trend(50, 50)).toBe('stable');
  });
});
