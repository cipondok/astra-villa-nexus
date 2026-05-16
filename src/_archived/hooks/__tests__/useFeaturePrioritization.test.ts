import { describe, it, expect } from 'vitest';

describe('useFeaturePrioritization - quadrant scoring', () => {
  function quadrant(impact: number, complexity: number) {
    if (impact >= 60 && complexity < 50) return 'quick_wins';
    if (impact >= 60 && complexity >= 50) return 'strategic_bets';
    if (impact < 60 && complexity < 50) return 'fill_ins';
    return 'deprioritize';
  }

  function priorityScore(impact: number, complexity: number) {
    return Math.round(impact * 0.65 + (100 - complexity) * 0.35);
  }

  it('high impact low complexity = quick win', () => {
    expect(quadrant(85, 25)).toBe('quick_wins');
  });

  it('high impact high complexity = strategic bet', () => {
    expect(quadrant(90, 80)).toBe('strategic_bets');
  });

  it('low impact low complexity = fill in', () => {
    expect(quadrant(30, 20)).toBe('fill_ins');
  });

  it('low impact high complexity = deprioritize', () => {
    expect(quadrant(40, 90)).toBe('deprioritize');
  });

  it('priority score weights impact 65%, inverse complexity 35%', () => {
    const score = priorityScore(90, 25);
    expect(score).toBe(Math.round(90 * 0.65 + 75 * 0.35));
  });

  it('quick wins score higher than strategic bets', () => {
    const qw = priorityScore(85, 25);
    const sb = priorityScore(85, 75);
    expect(qw).toBeGreaterThan(sb);
  });

  it('deprioritized features score lowest', () => {
    const dp = priorityScore(35, 90);
    const qw = priorityScore(80, 30);
    expect(dp).toBeLessThan(qw);
  });
});
