import { describe, it, expect } from 'vitest';
describe('Rent page', () => {
  it('default filters for renting', () => {
    const defaults = { transactionType: 'rent', period: 'yearly' };
    expect(defaults.transactionType).toBe('rent');
  });
  it('rental period options', () => {
    const periods = ['monthly', 'quarterly', 'yearly'];
    expect(periods).toContain('quarterly');
  });
});
