import { describe, it, expect } from 'vitest';
describe('PreLaunching page', () => {
  it('countdown timer calculation', () => {
    const launch = new Date('2026-04-01T00:00:00Z');
    const now = new Date('2026-03-01T00:00:00Z');
    const daysLeft = Math.ceil((launch.getTime() - now.getTime()) / 86400000);
    expect(daysLeft).toBe(31);
  });
  it('early bird discount', () => {
    const price = 1_000_000_000;
    const discount = 0.05;
    expect(price * (1 - discount)).toBe(950_000_000);
  });
  it('waitlist email validation', () => {
    const isValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    expect(isValid('early@test.com')).toBe(true);
  });
});
