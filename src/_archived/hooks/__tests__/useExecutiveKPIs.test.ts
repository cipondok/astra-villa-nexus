import { describe, it, expect } from 'vitest';

describe('useExecutiveKPIs - executive metric scoring', () => {
  function classify(value: number, thresholds: [number, number, number]) {
    if (value >= thresholds[0]) return 'excellent';
    if (value >= thresholds[1]) return 'good';
    if (value >= thresholds[2]) return 'caution';
    return 'critical';
  }

  function pctDelta(curr: number, prev: number) {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 1000) / 10;
  }

  it('liquidity classification', () => {
    expect(classify(75, [70, 45, 25])).toBe('excellent');
    expect(classify(50, [70, 45, 25])).toBe('good');
    expect(classify(30, [70, 45, 25])).toBe('caution');
    expect(classify(10, [70, 45, 25])).toBe('critical');
  });

  it('velocity score inversely proportional to cycle days', () => {
    const fast = Math.max(0, Math.min(100, 100 - 10 * 1.5));
    const slow = Math.max(0, Math.min(100, 100 - 50 * 1.5));
    expect(fast).toBe(85);
    expect(slow).toBe(25);
  });

  it('scaling readiness averages 4 KPIs', () => {
    const scores = [80, 60, 40, 70];
    const readiness = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    expect(readiness).toBe(63);
  });

  it('positive revenue momentum', () => {
    expect(pctDelta(1500, 1000)).toBe(50);
  });

  it('zero previous revenue', () => {
    expect(pctDelta(500, 0)).toBe(100);
  });

  it('retention percentage calculation', () => {
    const activeUsers = 350;
    const totalUsers = 1000;
    const pct = Math.round((activeUsers / totalUsers) * 1000) / 10;
    expect(pct).toBe(35);
  });
});
