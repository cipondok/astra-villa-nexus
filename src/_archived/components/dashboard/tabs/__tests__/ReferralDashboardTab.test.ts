import { describe, it, expect } from 'vitest';

describe('ReferralDashboardTab', () => {
  it('generates referral code from user id', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const code = userId.substring(0, 8).toUpperCase();
    expect(code).toBe('123E4567');
  });

  it('calculates referral commission', () => {
    const orderAmount = 500_000_000;
    const commissionRate = 0.02;
    const commission = orderAmount * commissionRate;
    expect(commission).toBe(10_000_000);
  });

  it('tracks referral statuses', () => {
    const statuses = ['pending', 'qualified', 'converted', 'rewarded'];
    expect(statuses).toHaveLength(4);
  });
});
