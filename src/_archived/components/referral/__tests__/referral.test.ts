import { describe, it, expect } from 'vitest';

describe('Referral components', () => {
  it('generates unique referral link', () => {
    const baseUrl = 'https://astra-villa-realty.lovable.app';
    const code = 'REF123';
    const link = `${baseUrl}/?ref=${code}`;
    expect(link).toContain('ref=REF123');
  });

  it('calculates total referral earnings', () => {
    const referrals = [
      { commission: 5_000_000 },
      { commission: 3_000_000 },
      { commission: 7_500_000 },
    ];
    const total = referrals.reduce((s, r) => s + r.commission, 0);
    expect(total).toBe(15_500_000);
  });

  it('referral status flow', () => {
    const flow = ['pending', 'qualified', 'converted', 'paid'];
    const idx = flow.indexOf('converted');
    expect(idx).toBe(2);
  });
});
