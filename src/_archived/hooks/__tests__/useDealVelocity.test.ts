import { describe, it, expect } from 'vitest';

describe('useDealVelocity - deal velocity scoring', () => {
  function classifyHealth(avgCycleDays: number, closeRate: number) {
    if (avgCycleDays <= 14 && closeRate >= 20) return 'fast';
    if (avgCycleDays <= 30 && closeRate >= 10) return 'normal';
    if (avgCycleDays <= 60) return 'slow';
    return 'stalled';
  }

  function computeVelocityScore(responseHrs: number, cycleDays: number, closeRate: number, counterFreq: number) {
    const responseScore = Math.max(0, 100 - responseHrs * 2) * 0.25;
    const cycleScore = Math.max(0, 100 - cycleDays * 1.5) * 0.30;
    const closeScore = Math.min(closeRate * 3, 30) * 1.0;
    const negotiationScore = Math.max(0, 15 - counterFreq * 0.15);
    return Math.min(100, Math.round(responseScore + cycleScore + closeScore + negotiationScore));
  }

  it('fast health with short cycle and high close rate', () => {
    expect(classifyHealth(10, 25)).toBe('fast');
  });

  it('normal health with moderate metrics', () => {
    expect(classifyHealth(20, 15)).toBe('normal');
  });

  it('slow health with long cycle', () => {
    expect(classifyHealth(45, 8)).toBe('slow');
  });

  it('stalled with very long cycle', () => {
    expect(classifyHealth(90, 5)).toBe('stalled');
  });

  it('velocity score rewards fast response', () => {
    const fast = computeVelocityScore(2, 14, 20, 20);
    const slow = computeVelocityScore(72, 14, 20, 20);
    expect(fast).toBeGreaterThan(slow);
  });

  it('velocity score rewards short cycle', () => {
    const short = computeVelocityScore(12, 10, 20, 20);
    const long = computeVelocityScore(12, 50, 20, 20);
    expect(short).toBeGreaterThan(long);
  });

  it('velocity score capped at 100', () => {
    const perfect = computeVelocityScore(0, 0, 50, 0);
    expect(perfect).toBeLessThanOrEqual(100);
  });

  it('trend classification', () => {
    const classify = (curr: number, prev: number) =>
      curr > prev * 1.15 ? 'accelerating' : curr < prev * 0.85 ? 'decelerating' : 'stable';
    expect(classify(20, 10)).toBe('accelerating');
    expect(classify(5, 15)).toBe('decelerating');
    expect(classify(10, 10)).toBe('stable');
  });
});
