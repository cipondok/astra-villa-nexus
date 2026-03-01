import { describe, it, expect } from 'vitest';
import { useCurrencyStore, CURRENCY_META, getCurrencyFormatter, getCurrencyFormatterShort, formatPriceRange, getCurrencySymbol } from '../currencyStore';

describe('CURRENCY_META', () => {
  it('has all 4 currencies', () => {
    expect(Object.keys(CURRENCY_META)).toEqual(['IDR', 'USD', 'SGD', 'AUD']);
  });

  it('IDR has correct symbol', () => {
    expect(CURRENCY_META.IDR.symbol).toBe('Rp');
  });

  it('USD has correct symbol', () => {
    expect(CURRENCY_META.USD.symbol).toBe('$');
  });
});

describe('useCurrencyStore', () => {
  it('defaults to IDR', () => {
    expect(useCurrencyStore.getState().currency).toBe('IDR');
  });

  it('setCurrency updates currency', () => {
    useCurrencyStore.getState().setCurrency('USD');
    expect(useCurrencyStore.getState().currency).toBe('USD');
    // Reset
    useCurrencyStore.getState().setCurrency('IDR');
  });
});

describe('getCurrencyFormatter', () => {
  it('formats IDR amount', () => {
    useCurrencyStore.getState().setCurrency('IDR');
    const fmt = getCurrencyFormatter();
    const result = fmt(1000000);
    expect(result).toContain('1.000.000');
  });
});

describe('getCurrencyFormatterShort', () => {
  it('formats billions for IDR', () => {
    useCurrencyStore.getState().setCurrency('IDR');
    const fmt = getCurrencyFormatterShort();
    const result = fmt(1500000000);
    expect(result).toContain('1.5B');
  });

  it('formats millions for IDR', () => {
    useCurrencyStore.getState().setCurrency('IDR');
    const fmt = getCurrencyFormatterShort();
    const result = fmt(5000000);
    expect(result).toContain('5M');
  });
});

describe('formatPriceRange', () => {
  it('returns range string', () => {
    useCurrencyStore.getState().setCurrency('IDR');
    const result = formatPriceRange(1000000000, 2000000000);
    expect(result).toContain('-');
  });
});

describe('getCurrencySymbol', () => {
  it('returns Rp for IDR', () => {
    useCurrencyStore.getState().setCurrency('IDR');
    expect(getCurrencySymbol()).toBe('Rp');
  });

  it('returns $ for USD', () => {
    useCurrencyStore.getState().setCurrency('USD');
    expect(getCurrencySymbol()).toBe('$');
    useCurrencyStore.getState().setCurrency('IDR');
  });
});
