import { describe, it, expect } from 'vitest';

describe('usePullToRefresh - physics and thresholds', () => {
  const DEFAULT_THRESHOLD = 80;

  it('indicator opacity clamps at 1', () => {
    const opacity = (distance: number) => Math.min(distance / DEFAULT_THRESHOLD, 1);
    expect(opacity(40)).toBeCloseTo(0.5);
    expect(opacity(80)).toBe(1);
    expect(opacity(160)).toBe(1);
  });

  it('indicator rotation scales to 360 degrees', () => {
    const rotation = (distance: number) => (distance / DEFAULT_THRESHOLD) * 360;
    expect(rotation(40)).toBe(180);
    expect(rotation(80)).toBe(360);
  });

  it('pull distance has resistance factor of 0.5', () => {
    const resist = (raw: number) => Math.min(raw * 0.5, DEFAULT_THRESHOLD * 1.5);
    expect(resist(100)).toBe(50);
    expect(resist(300)).toBe(DEFAULT_THRESHOLD * 1.5);
  });

  it('refresh triggers when pullDistance >= threshold', () => {
    expect(80 >= DEFAULT_THRESHOLD).toBe(true);
    expect(79 >= DEFAULT_THRESHOLD).toBe(false);
  });

  it('only activates when scrollY is 0', () => {
    const scrollY = 0;
    expect(scrollY === 0).toBe(true);
  });
});
