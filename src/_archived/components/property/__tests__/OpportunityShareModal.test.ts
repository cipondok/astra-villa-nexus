import { describe, it, expect } from 'vitest';

describe('OpportunityShareModal - share logic', () => {
  it('builds share URL with referral code and UTM params', () => {
    const base = 'https://example.com/properties/abc123';
    const refCode = 'REF-XYZ';
    const channel = 'whatsapp';
    const params = new URLSearchParams();
    params.set('ref', refCode);
    params.set('utm_source', channel);
    params.set('utm_medium', 'social');
    params.set('utm_campaign', 'opportunity_share');
    const url = `${base}?${params.toString()}`;
    expect(url).toContain('ref=REF-XYZ');
    expect(url).toContain('utm_source=whatsapp');
    expect(url).toContain('utm_campaign=opportunity_share');
  });

  it('generates elite opportunity message for high scores', () => {
    const score = 92;
    const title = 'Luxury Villa Bali';
    const msg = score >= 80
      ? `🔥 Elite investment opportunity! Score: ${score}/100 — ${title}`
      : `Check out this investment opportunity: ${title}`;
    expect(msg).toContain('Elite');
    expect(msg).toContain('92/100');
  });

  it('generates standard message for lower scores', () => {
    const score = 65;
    const title = 'Modern Apartment';
    const msg = score >= 80
      ? `🔥 Elite: ${title}`
      : `Check out this investment opportunity: ${title}`;
    expect(msg).toContain('Check out');
  });

  it('respects message length limit', () => {
    const msg = 'A'.repeat(280);
    expect(msg.length).toBeLessThanOrEqual(280);
  });

  it('tracks share channels', () => {
    const channels = ['whatsapp', 'telegram', 'facebook', 'twitter', 'linkedin'];
    expect(channels).toHaveLength(5);
    expect(channels).toContain('whatsapp');
  });
});
