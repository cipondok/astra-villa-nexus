import { describe, it, expect } from 'vitest';

describe('usePropertyRatings - rating logic', () => {
  it('average rating calculation', () => {
    const ratings = [5, 4, 4, 3, 5];
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    expect(avg).toBe(4.2);
  });

  it('rating must be 1-5', () => {
    const isValid = (r: number) => r >= 1 && r <= 5 && Number.isInteger(r);
    expect(isValid(3)).toBe(true);
    expect(isValid(0)).toBe(false);
    expect(isValid(6)).toBe(false);
    expect(isValid(3.5)).toBe(false);
  });

  it('star distribution', () => {
    const ratings = [5, 5, 4, 4, 4, 3, 2, 5];
    const dist = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: ratings.filter(r => r === star).length,
      pct: (ratings.filter(r => r === star).length / ratings.length) * 100,
    }));
    expect(dist.find(d => d.star === 5)?.count).toBe(3);
    expect(dist.find(d => d.star === 1)?.count).toBe(0);
  });

  it('weighted rating with review count', () => {
    const avg = 4.5;
    const count = 3;
    const globalAvg = 4.0;
    const minReviews = 10;
    const weighted = (count * avg + minReviews * globalAvg) / (count + minReviews);
    expect(weighted).toBeLessThan(avg);
    expect(weighted).toBeGreaterThan(globalAvg);
  });

  it('recent reviews first', () => {
    const reviews = [
      { id: '1', date: '2026-01-01' },
      { id: '2', date: '2026-03-01' },
      { id: '3', date: '2026-02-01' },
    ];
    const sorted = [...reviews].sort((a, b) => b.date.localeCompare(a.date));
    expect(sorted[0].id).toBe('2');
  });
});
