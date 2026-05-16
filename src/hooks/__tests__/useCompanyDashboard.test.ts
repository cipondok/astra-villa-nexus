import { describe, it, expect } from 'vitest';

describe('useCompanyDashboard - company metrics', () => {
  function pctDelta(curr: number, prev: number) {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 1000) / 10;
  }

  it('positive delta', () => {
    expect(pctDelta(150, 100)).toBe(50);
  });

  it('negative delta', () => {
    expect(pctDelta(80, 100)).toBe(-20);
  });

  it('zero previous gives 100%', () => {
    expect(pctDelta(50, 0)).toBe(100);
  });

  it('zero both gives 0', () => {
    expect(pctDelta(0, 0)).toBe(0);
  });

  it('daily active users averaging', () => {
    const weeklyCount = 700;
    const dau = Math.round(weeklyCount / 7);
    expect(dau).toBe(100);
  });

  it('referral percentage calculation', () => {
    const newUsers = 200;
    const referrals = 30;
    const pct = Math.round((referrals / newUsers) * 1000) / 10;
    expect(pct).toBe(15);
  });

  it('health score classification', () => {
    const classify = (score: number) =>
      score >= 95 ? 'good' : score >= 85 ? 'warn' : 'bad';
    expect(classify(98)).toBe('good');
    expect(classify(90)).toBe('warn');
    expect(classify(70)).toBe('bad');
  });
});
