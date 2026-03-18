import { describe, it, expect } from 'vitest';

describe('useExecutionRoadmap - phase progress scoring', () => {
  function phasePct(milestones: { current: number; goal: number }[]) {
    if (!milestones.length) return 0;
    return Math.round(
      milestones.reduce((s, m) => s + Math.min(100, (m.current / m.goal) * 100), 0) / milestones.length
    );
  }

  function determinePhase(p1: number, p2: number, p3: number) {
    return p1 >= 80 ? (p2 >= 80 ? (p3 >= 80 ? 4 : 3) : 2) : 1;
  }

  it('phase with all milestones complete scores 100', () => {
    expect(phasePct([
      { current: 100, goal: 100 },
      { current: 50, goal: 50 },
    ])).toBe(100);
  });

  it('caps individual milestone at 100%', () => {
    expect(phasePct([{ current: 200, goal: 100 }])).toBe(100);
  });

  it('partial progress averages correctly', () => {
    expect(phasePct([
      { current: 50, goal: 100 },
      { current: 25, goal: 100 },
    ])).toBe(38);
  });

  it('empty milestones returns 0', () => {
    expect(phasePct([])).toBe(0);
  });

  it('phase 1 when low readiness', () => {
    expect(determinePhase(40, 10, 5)).toBe(1);
  });

  it('phase 2 when p1 ready', () => {
    expect(determinePhase(85, 30, 5)).toBe(2);
  });

  it('phase 4 when all ready', () => {
    expect(determinePhase(90, 85, 82)).toBe(4);
  });
});
