import { describe, it, expect } from 'vitest';

describe('useVIPLimits - limit calculation logic', () => {
  const calc = (current: number, max: number) => ({
    remaining: Math.max(0, max - current),
    canAdd: current < max,
  });

  it('allows adding when under limit', () => {
    const { remaining, canAdd } = calc(3, 10);
    expect(canAdd).toBe(true);
    expect(remaining).toBe(7);
  });

  it('blocks adding when at limit', () => {
    const { remaining, canAdd } = calc(10, 10);
    expect(canAdd).toBe(false);
    expect(remaining).toBe(0);
  });

  it('blocks adding when over limit', () => {
    const { remaining, canAdd } = calc(12, 10);
    expect(canAdd).toBe(false);
    expect(remaining).toBe(0);
  });

  it('handles zero max correctly', () => {
    const { remaining, canAdd } = calc(0, 0);
    expect(canAdd).toBe(false);
    expect(remaining).toBe(0);
  });

  it('fresh user has full remaining', () => {
    const { remaining, canAdd } = calc(0, 5);
    expect(canAdd).toBe(true);
    expect(remaining).toBe(5);
  });
});
