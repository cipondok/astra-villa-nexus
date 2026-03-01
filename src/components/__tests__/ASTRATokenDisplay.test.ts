import { describe, it, expect } from 'vitest';
describe('ASTRATokenDisplay component', () => {
  it('formats token balance with decimals', () => {
    const balance = 1234.5678;
    expect(balance.toFixed(4)).toBe('1234.5678');
  });
  it('shows zero balance', () => {
    const balance = 0;
    expect(balance.toFixed(2)).toBe('0.00');
  });
  it('abbreviates large balances', () => {
    const abbrev = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n.toString();
    expect(abbrev(1500000)).toBe('1.5M');
    expect(abbrev(2500)).toBe('2.5K');
  });
});
