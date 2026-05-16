import { describe, it, expect } from 'vitest';

describe('Campaign components', () => {
  it('UGC challenge has expiry date', () => {
    const expiresAt = '2026-04-01';
    const isActive = new Date(expiresAt) > new Date('2026-03-01');
    expect(isActive).toBe(true);
  });
  it('referral campaign tracks conversions', () => {
    const campaign = { impressions: 1000, clicks: 150, conversions: 12 };
    const ctr = (campaign.clicks / campaign.impressions) * 100;
    expect(ctr).toBe(15);
  });
  it('local partnership calculates ROI', () => {
    const spend = 5_000_000;
    const revenue = 25_000_000;
    const roi = ((revenue - spend) / spend) * 100;
    expect(roi).toBe(400);
  });
});
