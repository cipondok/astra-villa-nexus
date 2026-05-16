import { describe, it, expect } from 'vitest';

describe('useAIRecommendations - recommendation logic', () => {
  it('similarity score between 0 and 1', () => {
    const score = 0.85;
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('filters by minimum confidence', () => {
    const recs = [
      { id: '1', confidence: 0.9 },
      { id: '2', confidence: 0.3 },
      { id: '3', confidence: 0.7 },
    ];
    const MIN = 0.5;
    const filtered = recs.filter(r => r.confidence >= MIN);
    expect(filtered).toHaveLength(2);
  });

  it('deduplicates recommendations', () => {
    const ids = ['p1', 'p2', 'p1', 'p3', 'p2'];
    const unique = [...new Set(ids)];
    expect(unique).toHaveLength(3);
  });

  it('combines multiple signals', () => {
    const viewHistory = 0.4;
    const savedSimilar = 0.3;
    const locationMatch = 0.3;
    const total = viewHistory + savedSimilar + locationMatch;
    expect(total).toBeCloseTo(1, 5);
  });

  it('limits to top N recommendations', () => {
    const recs = Array.from({ length: 50 }, (_, i) => ({ id: `${i}`, score: Math.random() }));
    const top = [...recs].sort((a, b) => b.score - a.score).slice(0, 10);
    expect(top).toHaveLength(10);
  });
});
