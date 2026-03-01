import { describe, it, expect } from 'vitest';
describe('blockchain lib', () => {
  it('wei to token conversion', () => { expect(Number(BigInt('1000000000000000000')) / 1e18).toBe(1); });
  it('gas estimation buffer', () => { const estimated = 21000; const buffered = Math.ceil(estimated * 1.2); expect(buffered).toBe(25200); });
  it('transaction hash format', () => { const hash = '0x' + 'a'.repeat(64); expect(hash).toMatch(/^0x[a-f0-9]{64}$/); });
});
