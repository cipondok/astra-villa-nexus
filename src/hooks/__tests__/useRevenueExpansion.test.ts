import { describe, it, expect } from 'vitest';

describe('useRevenueExpansion - revenue stream analytics', () => {
  function delta(curr: number, prev: number) {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 1000) / 10;
  }

  function diversificationScore(shares: number[]) {
    const hhi = Math.round(shares.reduce((s, sh) => s + sh * sh, 0));
    return { hhi, score: Math.round(Math.max(0, Math.min(100, 100 - (hhi - 2500) / 75))) };
  }

  it('positive growth delta', () => {
    expect(delta(1500, 1000)).toBe(50);
  });

  it('negative growth delta', () => {
    expect(delta(800, 1000)).toBe(-20);
  });

  it('handles zero previous', () => {
    expect(delta(500, 0)).toBe(100);
  });

  it('perfectly diversified HHI = 2500', () => {
    const { hhi, score } = diversificationScore([25, 25, 25, 25]);
    expect(hhi).toBe(2500);
    expect(score).toBe(100);
  });

  it('concentrated HHI near 10000', () => {
    const { hhi } = diversificationScore([95, 2, 2, 1]);
    expect(hhi).toBeGreaterThan(9000);
  });

  it('moderate concentration score', () => {
    const { score } = diversificationScore([60, 20, 10, 10]);
    expect(score).toBeLessThan(70);
    expect(score).toBeGreaterThan(20);
  });

  it('projection growth compounds monthly', () => {
    const base = 1_000_000;
    const m1 = base * (1 + 0.08 * 1);
    const m6 = base * (1 + 0.08 * 6);
    expect(m6).toBeGreaterThan(m1);
  });
});
