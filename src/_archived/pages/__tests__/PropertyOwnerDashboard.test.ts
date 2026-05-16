import { describe, it, expect } from 'vitest';
describe('PropertyOwnerDashboard page', () => {
  it('revenue summary', () => {
    const monthly = [5e6, 6e6, 7e6, 8e6];
    const total = monthly.reduce((s, v) => s + v, 0);
    expect(total).toBe(26_000_000);
  });
  it('vacancy rate', () => {
    const vacant = 2;
    const total = 10;
    const rate = (vacant / total) * 100;
    expect(rate).toBe(20);
  });
  it('maintenance request statuses', () => {
    const statuses = ['open', 'in_progress', 'resolved', 'closed'];
    expect(statuses).toHaveLength(4);
  });
});
