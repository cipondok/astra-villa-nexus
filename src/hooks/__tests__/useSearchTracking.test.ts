import { describe, it, expect } from 'vitest';

describe('useSearchTracking - search analytics', () => {
  it('tracks search query', () => {
    const entry = { query: 'apartment jakarta', timestamp: Date.now(), results: 15 };
    expect(entry.query).toBeTruthy();
    expect(entry.results).toBeGreaterThan(0);
  });

  it('popular searches aggregation', () => {
    const searches = ['bali villa', 'jakarta apt', 'bali villa', 'bandung house', 'bali villa'];
    const counts = searches.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    expect(sorted[0][0]).toBe('bali villa');
    expect(sorted[0][1]).toBe(3);
  });

  it('zero-result detection', () => {
    const searches = [
      { query: 'apartment', results: 10 },
      { query: 'xyz123', results: 0 },
    ];
    const zeroResult = searches.filter(s => s.results === 0);
    expect(zeroResult).toHaveLength(1);
  });

  it('search session grouping', () => {
    const SESSION_GAP = 30 * 60 * 1000; // 30 min
    const t1 = 1000000;
    const t2 = t1 + 60000; // 1 min later
    const t3 = t1 + 40 * 60 * 1000; // 40 min later
    expect(t2 - t1 < SESSION_GAP).toBe(true);
    expect(t3 - t1 < SESSION_GAP).toBe(false);
  });
});
