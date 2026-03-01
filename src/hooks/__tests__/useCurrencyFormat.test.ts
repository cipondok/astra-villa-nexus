import { describe, it, expect } from 'vitest';

describe('Currency formatting logic', () => {
  const formatIDR = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  it('formats small amounts', () => {
    const result = formatIDR(50000);
    expect(result).toContain('50');
  });

  it('formats billions', () => {
    const shortFormat = (amount: number) => {
      if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)}B`;
      if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M`;
      if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K`;
      return String(amount);
    };
    expect(shortFormat(2500000000)).toBe('2.5B');
    expect(shortFormat(750000000)).toBe('750.0M');
    expect(shortFormat(5000)).toBe('5.0K');
  });

  it('handles zero', () => {
    expect(formatIDR(0)).toContain('0');
  });

  it('handles negative values', () => {
    const result = formatIDR(-100000);
    expect(result).toContain('100');
  });

  it('USD conversion', () => {
    const idrAmount = 15000000;
    const rate = 15500;
    const usd = idrAmount / rate;
    expect(Math.round(usd)).toBeCloseTo(968, 0);
  });
});
