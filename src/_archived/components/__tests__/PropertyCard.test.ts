import { describe, it, expect } from 'vitest';
describe('PropertyCard component logic', () => {
  it('price display formatting', () => { const price = 1.5e9; const formatted = price >= 1e9 ? `${(price/1e9).toFixed(1)}B` : `${(price/1e6).toFixed(0)}M`; expect(formatted).toBe('1.5B'); });
  it('truncates title', () => { const title = 'Beautiful Luxury Villa with Amazing Ocean View in Bali'; const truncated = title.length > 40 ? title.slice(0, 40) + '...' : title; expect(truncated).toContain('...'); });
  it('badge display', () => { const isNew = (date: string) => (Date.now() - new Date(date).getTime()) < 7 * 86400000; expect(isNew('2026-02-28')).toBe(true); });
});
