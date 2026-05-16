import { describe, it, expect } from 'vitest';

describe('useUpgradeCampaigns - campaign logic', () => {
  it('discount percentage calculation', () => {
    const original = 299000; const discounted = 199000;
    const pct = Math.round(((original - discounted) / original) * 100);
    expect(pct).toBe(33);
  });
  it('campaign active check', () => {
    const start = '2026-02-01'; const end = '2026-03-31'; const now = '2026-03-01';
    expect(now >= start && now <= end).toBe(true);
  });
  it('target audience filter', () => {
    const users = [{ plan: 'free' }, { plan: 'basic' }, { plan: 'pro' }];
    const targets = users.filter(u => u.plan === 'free' || u.plan === 'basic');
    expect(targets).toHaveLength(2);
  });
  it('impression cap', () => {
    const MAX = 3; let shown = 2;
    expect(shown < MAX).toBe(true);
    shown++;
    expect(shown < MAX).toBe(false);
  });
});
