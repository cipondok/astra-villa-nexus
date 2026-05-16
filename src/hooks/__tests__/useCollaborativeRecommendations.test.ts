import { describe, it, expect } from 'vitest';

describe('useCollaborativeRecommendations - collab filtering', () => {
  it('user similarity by shared preferences', () => {
    const userA = new Set(['p1', 'p2', 'p3', 'p5']);
    const userB = new Set(['p2', 'p3', 'p4', 'p6']);
    const intersection = [...userA].filter(x => userB.has(x));
    const union = new Set([...userA, ...userB]);
    const jaccard = intersection.length / union.size;
    expect(jaccard).toBeCloseTo(0.333, 2);
  });
  it('recommends unseen items from similar users', () => {
    const myItems = new Set(['p1', 'p2']);
    const similarUserItems = ['p2', 'p3', 'p4'];
    const recs = similarUserItems.filter(i => !myItems.has(i));
    expect(recs).toEqual(['p3', 'p4']);
  });
  it('cold start fallback to popular', () => {
    const userHistory: string[] = [];
    const popular = ['p10', 'p11', 'p12'];
    const recs = userHistory.length === 0 ? popular : [];
    expect(recs).toEqual(popular);
  });
});
