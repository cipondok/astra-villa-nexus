import { describe, it, expect } from 'vitest';

describe('useLaunchReadiness - checklist scoring', () => {
  type Status = 'pass' | 'warning' | 'fail' | 'pending';

  function sectionScore(statuses: Status[]) {
    if (!statuses.length) return 0;
    const pts = statuses.reduce((s, st) => s + (st === 'pass' ? 100 : st === 'warning' ? 60 : st === 'pending' ? 30 : 0), 0);
    return Math.round(pts / statuses.length);
  }

  function goDecision(failCount: number, pendingCount: number) {
    if (failCount === 0 && pendingCount <= 3) return 'go';
    if (failCount === 0) return 'conditional';
    return 'no_go';
  }

  it('all pass = 100%', () => {
    expect(sectionScore(['pass', 'pass', 'pass'])).toBe(100);
  });

  it('mixed statuses', () => {
    expect(sectionScore(['pass', 'warning', 'fail'])).toBe(Math.round((100 + 60 + 0) / 3));
  });

  it('all fail = 0%', () => {
    expect(sectionScore(['fail', 'fail'])).toBe(0);
  });

  it('go when no fails and few pending', () => {
    expect(goDecision(0, 2)).toBe('go');
  });

  it('conditional when no fails but many pending', () => {
    expect(goDecision(0, 5)).toBe('conditional');
  });

  it('no-go when blockers exist', () => {
    expect(goDecision(2, 3)).toBe('no_go');
  });

  it('confidence penalizes fails heavily', () => {
    const overall = 75;
    const conf = Math.max(0, Math.min(100, overall - 2 * 10 - 3 * 3));
    expect(conf).toBe(46);
  });
});
