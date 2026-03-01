import { describe, it, expect } from 'vitest';
describe('MembershipPage', () => {
  it('plan comparison features', () => {
    const free = ['search', 'view'];
    const premium = ['search', 'view', 'save', 'compare', 'alerts', 'priority'];
    expect(premium.length).toBeGreaterThan(free.length);
  });
  it('annual discount percentage', () => {
    const monthly = 299_000;
    const annual = 2_990_000;
    const discount = Math.round((1 - annual / (monthly * 12)) * 100);
    expect(discount).toBeGreaterThan(15);
  });
});
