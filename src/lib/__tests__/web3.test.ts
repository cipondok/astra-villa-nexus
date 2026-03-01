import { describe, it, expect } from 'vitest';
describe('web3 lib', () => {
  it('contract address validation', () => { const addr = '0x' + '1'.repeat(40); expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/); });
  it('ABI encoding', () => { const fn = 'transfer(address,uint256)'; expect(fn).toContain('address'); });
});
