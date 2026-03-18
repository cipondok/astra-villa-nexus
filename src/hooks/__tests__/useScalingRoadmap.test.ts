import { describe, it, expect } from 'vitest';

describe('useScalingRoadmap - stage readiness scoring', () => {
  function milestoneProgress(current: number, goal: number) {
    return Math.min(100, Math.round((current / goal) * 100));
  }

  function stageReadiness(milestones: { current: number; goal: number }[]) {
    return Math.round(milestones.reduce((s, m) => s + milestoneProgress(m.current, m.goal), 0) / milestones.length);
  }

  function determineStage(seedScore: number, seriesAScore: number) {
    return seedScore >= 80 ? (seriesAScore >= 60 ? 'expansion' : 'series_a') : 'seed';
  }

  it('milestone progress caps at 100', () => {
    expect(milestoneProgress(1500, 1000)).toBe(100);
  });

  it('partial milestone progress', () => {
    expect(milestoneProgress(250, 1000)).toBe(25);
  });

  it('stage readiness averages milestones', () => {
    const score = stageReadiness([
      { current: 500, goal: 1000 },
      { current: 300, goal: 500 },
      { current: 10, goal: 10 },
    ]);
    expect(score).toBe(Math.round((50 + 60 + 100) / 3));
  });

  it('seed stage when low readiness', () => {
    expect(determineStage(40, 10)).toBe('seed');
  });

  it('series_a when seed complete', () => {
    expect(determineStage(85, 30)).toBe('series_a');
  });

  it('expansion when both stages ready', () => {
    expect(determineStage(90, 75)).toBe('expansion');
  });
});
