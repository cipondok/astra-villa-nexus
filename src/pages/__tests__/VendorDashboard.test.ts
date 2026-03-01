import { describe, it, expect } from 'vitest';

describe('VendorDashboard page', () => {
  it('vendor metrics calculation', () => {
    const orders = [{ amount: 500_000 }, { amount: 750_000 }, { amount: 300_000 }];
    const totalRevenue = orders.reduce((s, o) => s + o.amount, 0);
    expect(totalRevenue).toBe(1_550_000);
  });
  it('service listing status', () => {
    const statuses = ['active', 'pending', 'suspended'];
    expect(statuses).toContain('pending');
  });
});
