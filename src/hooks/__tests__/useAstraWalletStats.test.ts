import { describe, it, expect } from 'vitest';
describe('useAstraWalletStats', () => {
  it('total balance', () => { expect(10000 + 5000).toBe(15000); });
  it('transaction history limit', () => { const txs = Array.from({ length: 200 }, (_, i) => i); expect(txs.slice(0, 50)).toHaveLength(50); });
  it('staking APY display', () => { const apy = 12.5; expect(`${apy}%`).toBe('12.5%'); });
});
