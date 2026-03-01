import { describe, it, expect, vi } from 'vitest';
import { formatIDRPlain, parseIDR } from '../currency';

// Mock the currency store to avoid Zustand dependency
vi.mock('@/stores/currencyStore', () => ({
  getCurrencyFormatter: () => (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`,
}));

describe('formatIDRPlain', () => {
  it('formats number with Indonesian locale', () => {
    const result = formatIDRPlain(1000000);
    // Should contain digits without currency symbol
    expect(result).not.toContain('Rp');
    expect(result.replace(/\D/g, '')).toBe('1000000');
  });

  it('formats 0', () => {
    expect(formatIDRPlain(0)).toBe('0');
  });

  it('formats large number', () => {
    const result = formatIDRPlain(1500000000);
    expect(result.replace(/\D/g, '')).toBe('1500000000');
  });
});

describe('parseIDR', () => {
  it('parses formatted string to number', () => {
    expect(parseIDR('Rp 1.000.000')).toBe(1000000);
  });

  it('returns 0 for empty string', () => {
    expect(parseIDR('')).toBe(0);
  });

  it('returns 0 for non-numeric string', () => {
    expect(parseIDR('abc')).toBe(0);
  });

  it('parses string with only digits', () => {
    expect(parseIDR('500000')).toBe(500000);
  });

  it('strips all non-digit characters', () => {
    expect(parseIDR('Rp 1,500,000.00')).toBe(150000000);
  });
});
