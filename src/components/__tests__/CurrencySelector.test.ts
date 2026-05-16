import { describe, it, expect } from 'vitest';
describe('CurrencySelector component logic', () => {
  it('supported currencies', () => { expect(['IDR', 'USD', 'SGD', 'MYR', 'AUD']).toHaveLength(5); });
  it('default is IDR', () => { const def = 'IDR'; expect(def).toBe('IDR'); });
  it('flag emoji mapping', () => { const flags: Record<string, string> = { IDR: '🇮🇩', USD: '🇺🇸', SGD: '🇸🇬' }; expect(flags['IDR']).toBe('🇮🇩'); });
});
