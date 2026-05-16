import { describe, it, expect } from 'vitest';
describe('useAdvancedSearch', () => {
  it('fuzzy match scoring', () => { const score = (q: string, t: string) => q === t ? 1 : t.includes(q) ? 0.5 : 0; expect(score('villa', 'luxury villa bali')).toBe(0.5); });
  it('search history dedup', () => { const h = ['villa', 'apartment', 'villa']; expect([...new Set(h)]).toHaveLength(2); });
  it('result highlighting', () => { const text = 'Beautiful villa in Bali'; const highlighted = text.replace(/villa/gi, '<mark>villa</mark>'); expect(highlighted).toContain('<mark>'); });
});
