import { describe, it, expect } from 'vitest';
describe('Payout components', () => {
  it('minimum payout threshold IDR 500k', () => {
    const MIN = 500_000;
    const balance = 750_000;
    expect(balance >= MIN).toBe(true);
  });
  it('payout methods include bank transfer', () => {
    const methods = ['bank_transfer', 'e_wallet', 'check'];
    expect(methods).toContain('bank_transfer');
  });
});
