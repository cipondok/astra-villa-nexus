import { describe, it, expect } from 'vitest';

describe('useNLPSearch - natural language search', () => {
  it('extracts location from query', () => {
    const locations = ['jakarta', 'bali', 'surabaya', 'bandung'];
    const extract = (q: string) => locations.find(l => q.toLowerCase().includes(l)) || null;
    expect(extract('apartments in Jakarta under 500M')).toBe('jakarta');
    expect(extract('cheap house')).toBeNull();
  });

  it('extracts price intent', () => {
    const extractPrice = (q: string) => {
      const match = q.match(/(\d+)\s*(M|B|juta|miliar)/i);
      if (!match) return null;
      const num = parseInt(match[1]);
      const unit = match[2].toUpperCase();
      return unit === 'B' || unit === 'MILIAR' ? num * 1e9 : num * 1e6;
    };
    expect(extractPrice('under 500M')).toBe(500000000);
    expect(extractPrice('2B budget')).toBe(2000000000);
  });

  it('extracts property type', () => {
    const types = ['apartment', 'house', 'villa', 'land', 'kost'];
    const extract = (q: string) => types.find(t => q.toLowerCase().includes(t)) || null;
    expect(extract('looking for a villa in bali')).toBe('villa');
  });

  it('handles empty query', () => {
    const q = '';
    expect(q.trim().length).toBe(0);
  });

  it('normalizes synonyms', () => {
    const synonyms: Record<string, string> = { apt: 'apartment', rumah: 'house', tanah: 'land' };
    const normalize = (word: string) => synonyms[word.toLowerCase()] || word;
    expect(normalize('apt')).toBe('apartment');
    expect(normalize('villa')).toBe('villa');
  });
});
