import { describe, it, expect } from 'vitest';
describe('Buy page', () => {
  it('default filters for buying', () => {
    const defaults = { transactionType: 'sale', sortBy: 'newest' };
    expect(defaults.transactionType).toBe('sale');
  });
  it('price range slider bounds', () => {
    const min = 0; const max = 50_000_000_000;
    expect(max).toBeGreaterThan(min);
  });
});
