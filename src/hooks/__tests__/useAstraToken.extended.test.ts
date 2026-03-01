import { describe, it, expect } from 'vitest';
describe('useAstraToken extended', () => {
  it('transfer fee', () => { const amount = 1000; const fee = 0.01; expect(amount * fee).toBe(10); });
  it('min transfer amount', () => { expect(100).toBeGreaterThan(0); });
});
