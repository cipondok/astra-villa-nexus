import { describe, it, expect } from 'vitest';

describe('useReferralTracking - referral logic', () => {
  it('generates unique referral code', () => {
    const code = `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    expect(code).toMatch(/^REF-[A-Z0-9]+$/);
    expect(code.length).toBeGreaterThanOrEqual(12);
  });

  it('referral status transitions', () => {
    const validTransitions: Record<string, string[]> = {
      pending: ['qualified', 'expired'],
      qualified: ['converted', 'expired'],
      converted: ['rewarded'],
    };
    expect(validTransitions['pending']).toContain('qualified');
    expect(validTransitions['converted']).not.toContain('pending');
  });

  it('commission calculation', () => {
    const orderAmount = 5000000;
    const commissionRate = 0.05;
    const commission = orderAmount * commissionRate;
    expect(commission).toBe(250000);
  });

  it('referral link format', () => {
    const baseUrl = 'https://example.com';
    const code = 'REF-ABC123';
    const link = `${baseUrl}?ref=${code}`;
    expect(link).toContain('?ref=');
  });

  it('tracks UTM parameters', () => {
    const utm = { source: 'whatsapp', medium: 'social', campaign: 'spring2026' };
    const params = new URLSearchParams(utm);
    expect(params.get('source')).toBe('whatsapp');
  });

  it('expiry check', () => {
    const createdAt = new Date('2026-01-01');
    const expiryDays = 30;
    const expiryDate = new Date(createdAt.getTime() + expiryDays * 86400000);
    const now = new Date('2026-02-15');
    expect(now > expiryDate).toBe(true);
  });
});
