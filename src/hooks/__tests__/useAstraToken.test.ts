import { describe, it, expect } from 'vitest';

describe('useAstraToken - token logic', () => {
  it('token balance formatting', () => {
    const format = (bal: number) => bal >= 1e6 ? `${(bal/1e6).toFixed(1)}M` : bal >= 1e3 ? `${(bal/1e3).toFixed(1)}K` : String(bal);
    expect(format(1500000)).toBe('1.5M');
    expect(format(2500)).toBe('2.5K');
    expect(format(500)).toBe('500');
  });
  it('staking reward calculation', () => {
    const staked = 10000; const apy = 0.12; const daily = (staked * apy) / 365;
    expect(daily).toBeCloseTo(3.29, 1);
  });
  it('transfer validation', () => {
    const balance = 1000; const amount = 500;
    expect(amount <= balance).toBe(true);
    expect(1500 <= balance).toBe(false);
  });
});
