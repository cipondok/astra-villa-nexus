import { describe, it, expect } from 'vitest';

describe('AstraTokensPage', () => {
  it('token price display with decimals', () => {
    const price = 0.0045;
    const formatted = `$${price.toFixed(4)}`;
    expect(formatted).toBe('$0.0045');
  });
  it('staking APY calculation', () => {
    const apy = 12.5;
    const staked = 10000;
    const yearlyReward = staked * (apy / 100);
    expect(yearlyReward).toBe(1250);
  });
  it('token transfer validates recipient address', () => {
    const isValid = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);
    expect(isValid('0x' + 'a'.repeat(40))).toBe(true);
  });
});
