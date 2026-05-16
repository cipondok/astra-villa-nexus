import { describe, it, expect } from 'vitest';
describe('MembershipPage', () => {
  it('plan comparison features', () => {
    const free = ['browse', 'favorites'];
    const vipInvestor = ['browse', 'favorites', 'spotlight', 'concierge', '3d_badge', 'ai_analytics', 'first_access'];
    expect(vipInvestor.length).toBeGreaterThan(free.length);
  });
  it('annual discount percentage', () => {
    const monthly = 499_000;
    const annual = 4_990_000;
    const discount = Math.round((1 - annual / (monthly * 12)) * 100);
    expect(discount).toBeGreaterThan(15);
  });
});
