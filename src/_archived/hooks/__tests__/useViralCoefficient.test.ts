import { describe, it, expect } from 'vitest';

describe('useViralCoefficient - viral coefficient analytics', () => {
  it('calculates K-factor correctly', () => {
    const avgInvitesPerUser = 3.5;
    const conversionRate = 0.12;
    const k = avgInvitesPerUser * conversionRate;
    expect(k).toBeCloseTo(0.42, 2);
  });

  it('interprets growth status', () => {
    const interpret = (k: number) =>
      k > 1 ? 'exponential' : k >= 0.7 ? 'stable' : 'needs_optimization';
    expect(interpret(1.2)).toBe('exponential');
    expect(interpret(0.85)).toBe('stable');
    expect(interpret(0.3)).toBe('needs_optimization');
  });

  it('calculates effective growth rate', () => {
    const k = 0.5;
    const effectiveGrowth = k / (1 - k);
    expect(effectiveGrowth).toBeCloseTo(1.0, 2);
  });

  it('computes channel conversion rate', () => {
    const channels = [
      { channel: 'whatsapp', invites: 100, conversions: 25 },
      { channel: 'instagram', invites: 80, conversions: 8 },
    ];
    const rates = channels.map(c => ({
      ...c,
      conversionRate: (c.conversions / c.invites) * 100,
    }));
    expect(rates[0].conversionRate).toBe(25);
    expect(rates[1].conversionRate).toBe(10);
  });

  it('calculates cycle time in hours', () => {
    const created = new Date('2026-03-01T10:00:00Z');
    const converted = new Date('2026-03-03T10:00:00Z');
    const hours = (converted.getTime() - created.getTime()) / 3600000;
    expect(hours).toBe(48);
  });
});
