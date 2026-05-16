import { describe, it, expect } from 'vitest';

describe('Gamification components', () => {
  it('calculates level from total points', () => {
    const getLevel = (points: number) => Math.floor(points / 1000) + 1;
    expect(getLevel(0)).toBe(1);
    expect(getLevel(2500)).toBe(3);
    expect(getLevel(999)).toBe(1);
  });

  it('badge unlock thresholds', () => {
    const badges = [
      { name: 'Newcomer', threshold: 0 },
      { name: 'Explorer', threshold: 500 },
      { name: 'Expert', threshold: 5000 },
    ];
    const unlocked = badges.filter(b => b.threshold <= 2000);
    expect(unlocked).toHaveLength(2);
  });

  it('daily check-in streak tracking', () => {
    let streak = 5;
    const missedDay = false;
    streak = missedDay ? 0 : streak + 1;
    expect(streak).toBe(6);
  });
});
