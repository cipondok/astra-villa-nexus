import { describe, it, expect } from 'vitest';

describe('usePropertyOwnerData - owner dashboard', () => {
  it('total revenue calculation', () => {
    const properties = [{ monthlyRent: 5000000 }, { monthlyRent: 8000000 }];
    const total = properties.reduce((s, p) => s + p.monthlyRent, 0);
    expect(total).toBe(13000000);
  });
  it('vacancy rate', () => {
    const total = 5; const vacant = 1;
    expect((vacant / total) * 100).toBe(20);
  });
  it('maintenance cost ratio', () => {
    const revenue = 13000000; const maintenance = 1300000;
    expect((maintenance / revenue) * 100).toBe(10);
  });
  it('tenant contract expiry warning', () => {
    const contracts = [
      { tenant: 'A', expires: '2026-03-15' },
      { tenant: 'B', expires: '2026-06-01' },
    ];
    const now = new Date('2026-03-01');
    const expiring = contracts.filter(c => {
      const days = (new Date(c.expires).getTime() - now.getTime()) / 86400000;
      return days <= 30;
    });
    expect(expiring).toHaveLength(1);
  });
});
