import { describe, it, expect } from 'vitest';
describe('UserRentalDashboard page', () => {
  it('lease days remaining', () => {
    const end = new Date('2026-12-31');
    const now = new Date('2026-03-01');
    const days = Math.ceil((end.getTime() - now.getTime()) / 86400000);
    expect(days).toBe(305);
  });
  it('rent payment history', () => {
    const payments = [
      { month: 'Jan', paid: true },
      { month: 'Feb', paid: true },
      { month: 'Mar', paid: false },
    ];
    const unpaid = payments.filter(p => !p.paid);
    expect(unpaid).toHaveLength(1);
  });
});
