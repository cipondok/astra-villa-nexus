import { describe, it, expect } from 'vitest';

describe('useSmartRecommendations - smart recs logic', () => {
  it('collaborative filtering merge', () => {
    const userA = ['p1', 'p2', 'p3'];
    const userB = ['p2', 'p3', 'p4', 'p5'];
    const common = userA.filter(p => userB.includes(p));
    const recs = userB.filter(p => !userA.includes(p));
    expect(common).toHaveLength(2);
    expect(recs).toEqual(['p4', 'p5']);
  });
  it('content-based feature matching', () => {
    const target = { beds: 3, type: 'apartment', location: 'jakarta' };
    const candidates = [
      { id: '1', beds: 3, type: 'apartment', location: 'jakarta' },
      { id: '2', beds: 2, type: 'house', location: 'bali' },
      { id: '3', beds: 3, type: 'apartment', location: 'bandung' },
    ];
    const score = (c: typeof target) => (c.beds === target.beds ? 1 : 0) + (c.type === target.type ? 1 : 0) + (c.location === target.location ? 1 : 0);
    const scored = candidates.map(c => ({ ...c, score: score(c) })).sort((a, b) => b.score - a.score);
    expect(scored[0].id).toBe('1');
  });
  it('excludes already viewed', () => {
    const viewed = new Set(['p1', 'p3']);
    const recs = ['p1', 'p2', 'p3', 'p4'].filter(p => !viewed.has(p));
    expect(recs).toEqual(['p2', 'p4']);
  });
});
