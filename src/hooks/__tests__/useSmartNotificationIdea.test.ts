import { describe, it, expect } from 'vitest';
import { generateSmartNotifications } from '../useSmartNotificationIdea';

describe('generateSmartNotifications', () => {
  it('generates accelerating momentum notifications', () => {
    const r = generateSmartNotifications({ city: 'Bandung', market_momentum: 'accelerating', new_listings: 12 });
    expect(r.urgency_notification).toContain('Bandung');
    expect(r.urgency_notification).toContain('12');
    expect(r.curiosity_notification).toContain('viral');
    expect(r.investment_notification).toContain('capital gain');
  });

  it('generates stable momentum notifications', () => {
    const r = generateSmartNotifications({ city: 'Jakarta', market_momentum: 'stable', new_listings: 8 });
    expect(r.urgency_notification).toContain('stabil');
    expect(r.curiosity_notification).toContain('hidden gem');
    expect(r.investment_notification).toContain('yield');
  });

  it('generates decelerating momentum notifications', () => {
    const r = generateSmartNotifications({ city: 'Surabaya', market_momentum: 'decelerating', new_listings: 5 });
    expect(r.urgency_notification).toContain('negosiasi');
    expect(r.investment_notification).toContain('entry point');
  });

  it('generates cooling momentum notifications', () => {
    const r = generateSmartNotifications({ city: 'Bali', market_momentum: 'cooling', new_listings: 3 });
    expect(r.urgency_notification).toContain('koreksi');
    expect(r.investment_notification).toContain('Value buying');
  });

  it('falls back to stable for unknown momentum', () => {
    const r = generateSmartNotifications({ city: 'Medan', market_momentum: 'unknown', new_listings: 10 });
    expect(r.urgency_notification).toContain('stabil');
  });
});
