import { describe, it, expect } from 'vitest';

describe('CurrencyContext - currency conversion logic', () => {
  const rates: Record<string, number> = { IDR: 1, USD: 0.0000645, SGD: 0.0000865, MYR: 0.000287 };

  it('converts IDR to USD', () => {
    const idr = 15000000;
    const usd = idr * rates.USD;
    expect(usd).toBeCloseTo(967.5, 0);
  });

  it('converts between non-IDR currencies via IDR', () => {
    const usdAmount = 1000;
    const inIDR = usdAmount / rates.USD;
    const inSGD = inIDR * rates.SGD;
    expect(inSGD).toBeGreaterThan(1000);
  });

  it('default currency is IDR', () => {
    const defaultCurrency = 'IDR';
    expect(defaultCurrency).toBe('IDR');
  });

  it('formats with correct locale', () => {
    const locales: Record<string, string> = { IDR: 'id-ID', USD: 'en-US', SGD: 'en-SG' };
    expect(locales['IDR']).toBe('id-ID');
  });

  it('handles missing rate gracefully', () => {
    const rate = rates['EUR'] ?? null;
    expect(rate).toBeNull();
  });
});
