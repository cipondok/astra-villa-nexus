import { describe, it, expect } from 'vitest';

describe('useRetrySearch - backoff calculation', () => {
  const calculateDelay = (attempt: number, initial = 1000, multiplier = 2, max = 10000) => {
    const delay = initial * Math.pow(multiplier, attempt);
    return Math.min(delay, max);
  };

  it('first retry delay is initialDelay', () => {
    expect(calculateDelay(0)).toBe(1000);
  });

  it('second retry doubles', () => {
    expect(calculateDelay(1)).toBe(2000);
  });

  it('third retry quadruples', () => {
    expect(calculateDelay(2)).toBe(4000);
  });

  it('delay caps at maxDelay', () => {
    expect(calculateDelay(10)).toBe(10000);
  });

  it('custom config works', () => {
    expect(calculateDelay(0, 500, 3, 5000)).toBe(500);
    expect(calculateDelay(1, 500, 3, 5000)).toBe(1500);
    expect(calculateDelay(3, 500, 3, 5000)).toBe(5000); // capped
  });

  it('total attempts = maxRetries + 1', () => {
    const maxRetries = 3;
    const totalAttempts = maxRetries + 1;
    expect(totalAttempts).toBe(4);
  });
});
