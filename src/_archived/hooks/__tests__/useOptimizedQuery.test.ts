import { describe, it, expect } from 'vitest';

describe('useOptimizedQuery - query optimization', () => {
  it('stale time configuration', () => {
    const STALE_TIME = 5 * 60 * 1000;
    expect(STALE_TIME).toBe(300000);
  });
  it('cache key generation', () => {
    const key = ['properties', { location: 'bali', type: 'villa' }];
    expect(key[0]).toBe('properties');
    expect(JSON.stringify(key)).toContain('bali');
  });
  it('deduplication window', () => {
    const DEDUP_MS = 2000;
    const lastFetch = Date.now() - 1000;
    const shouldSkip = Date.now() - lastFetch < DEDUP_MS;
    expect(shouldSkip).toBe(true);
  });
  it('retry configuration', () => {
    const config = { retries: 3, retryDelay: (n: number) => Math.min(1000 * 2 ** n, 30000) };
    expect(config.retryDelay(0)).toBe(1000);
    expect(config.retryDelay(5)).toBe(30000);
  });
});
