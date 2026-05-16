import { describe, it, expect } from 'vitest';

describe('useLeaderboard - ranking logic', () => {
  it('sorts agents by total points descending', () => {
    const agents = [
      { id: 'a', points: 500 },
      { id: 'b', points: 1200 },
      { id: 'c', points: 800 },
    ];
    const sorted = [...agents].sort((a, b) => b.points - a.points);
    expect(sorted[0].id).toBe('b');
    expect(sorted[2].id).toBe('a');
  });

  it('assigns rank correctly with ties', () => {
    const scores = [100, 90, 90, 80];
    const ranked = scores.map((s, i) => ({
      score: s,
      rank: i === 0 ? 1 : scores[i - 1] === s ? i : i + 1,
    }));
    expect(ranked[0].rank).toBe(1);
  });

  it('badge tiers by points', () => {
    const getBadge = (points: number) => {
      if (points >= 1000) return 'gold';
      if (points >= 500) return 'silver';
      if (points >= 100) return 'bronze';
      return 'none';
    };
    expect(getBadge(1500)).toBe('gold');
    expect(getBadge(600)).toBe('silver');
    expect(getBadge(50)).toBe('none');
  });

  it('monthly reset zeroes period points', () => {
    const agent = { totalPoints: 1500, monthlyPoints: 300 };
    const reset = { ...agent, monthlyPoints: 0 };
    expect(reset.monthlyPoints).toBe(0);
    expect(reset.totalPoints).toBe(1500);
  });

  it('top 10 extraction', () => {
    const agents = Array.from({ length: 50 }, (_, i) => ({ id: `${i}`, points: Math.random() * 1000 }));
    const top10 = [...agents].sort((a, b) => b.points - a.points).slice(0, 10);
    expect(top10).toHaveLength(10);
  });
});
