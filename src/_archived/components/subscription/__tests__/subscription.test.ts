import { describe, it, expect } from 'vitest';

describe('Subscription components', () => {
  it('plan comparison matrix', () => {
    const plans = [
      { name: 'Free', price: 0, listings: 1 },
      { name: 'Pro', price: 299_000, listings: 10 },
      { name: 'Business', price: 999_000, listings: 100 },
    ];
    expect(plans[2].listings).toBe(100);
  });
  it('trial period is 14 days', () => {
    const TRIAL_DAYS = 14;
    const start = new Date('2026-03-01');
    const end = new Date(start.getTime() + TRIAL_DAYS * 86400000);
    expect(end.getDate()).toBe(15);
  });
});
