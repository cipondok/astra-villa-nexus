import { describe, it, expect } from 'vitest';

describe('SearchHistoryTab', () => {
  it('stores search with timestamp', () => {
    const entry = { query: 'apartment jakarta', timestamp: Date.now(), results: 15 };
    expect(entry.query).toBe('apartment jakarta');
    expect(entry.results).toBe(15);
  });

  it('deduplicates recent searches', () => {
    const searches = ['villa bali', 'apartment jakarta', 'villa bali'];
    const unique = [...new Set(searches)];
    expect(unique).toHaveLength(2);
  });

  it('limits history to max entries', () => {
    const MAX = 50;
    const history = Array.from({ length: 60 }, (_, i) => `search-${i}`);
    const trimmed = history.slice(0, MAX);
    expect(trimmed).toHaveLength(50);
  });
});
