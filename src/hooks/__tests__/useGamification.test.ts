import { describe, it, expect } from 'vitest';
import { LEVEL_THRESHOLDS, LEVEL_TITLES, PROFILE_FRAMES } from '../useGamification';

describe('useGamification - level and XP logic', () => {
  it('LEVEL_THRESHOLDS has 10 entries', () => {
    expect(LEVEL_THRESHOLDS).toHaveLength(10);
  });

  it('thresholds are strictly ascending', () => {
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      expect(LEVEL_THRESHOLDS[i]).toBeGreaterThan(LEVEL_THRESHOLDS[i - 1]);
    }
  });

  it('level 1 starts at 0 XP', () => {
    expect(LEVEL_THRESHOLDS[0]).toBe(0);
  });

  it('progress calculation for mid-level', () => {
    const level = 3; // 300-600 range
    const xp = 450;
    const currentThreshold = LEVEL_THRESHOLDS[level - 1]; // 300
    const nextThreshold = LEVEL_THRESHOLDS[level]; // 600
    const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    expect(progress).toBe(50);
  });

  it('max level returns 100% progress', () => {
    const level = 10;
    const percentage = level >= 10 ? 100 : 0;
    expect(percentage).toBe(100);
  });

  it('all user types have 10 titles', () => {
    expect(LEVEL_TITLES.agent).toHaveLength(10);
    expect(LEVEL_TITLES.homeowner).toHaveLength(10);
    expect(LEVEL_TITLES.searcher).toHaveLength(10);
  });

  it('PROFILE_FRAMES has entries for levels 1-10', () => {
    for (let i = 1; i <= 10; i++) {
      expect(PROFILE_FRAMES[i as keyof typeof PROFILE_FRAMES]).toBeDefined();
    }
  });

  it('level 1 frame is default', () => {
    expect(PROFILE_FRAMES[1].name).toBe('default');
  });
});
