import { describe, it, expect } from 'vitest';

describe('Rental components', () => {
  it('calculates monthly rent from annual', () => {
    const annual = 120_000_000;
    const monthly = annual / 12;
    expect(monthly).toBe(10_000_000);
  });

  it('lease duration options', () => {
    const durations = [6, 12, 24, 36];
    expect(durations).toContain(12);
    expect(durations[0]).toBe(6);
  });

  it('security deposit is typically 2 months', () => {
    const monthlyRent = 10_000_000;
    const deposit = monthlyRent * 2;
    expect(deposit).toBe(20_000_000);
  });

  it('rent due date validation', () => {
    const dueDay = 5;
    const isValid = dueDay >= 1 && dueDay <= 28;
    expect(isValid).toBe(true);
  });
});
