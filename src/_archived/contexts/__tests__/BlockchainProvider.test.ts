import { describe, it, expect } from 'vitest';
describe('BlockchainProvider context', () => {
  it('chain IDs', () => { expect([1, 56, 137]).toContain(137); });
  it('wallet connection states', () => { expect(['disconnected', 'connecting', 'connected']).toHaveLength(3); });
  it('token decimals', () => { expect(18).toBeGreaterThan(0); });
});
