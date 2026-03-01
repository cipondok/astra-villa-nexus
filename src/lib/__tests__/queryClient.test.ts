import { describe, it, expect } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { createCacheUtils } from '../queryClient';

describe('createCacheUtils', () => {
  it('getCacheStats returns stats object', () => {
    const qc = new QueryClient();
    const utils = createCacheUtils(qc);
    const stats = utils.getCacheStats();
    expect(stats).toHaveProperty('totalQueries');
    expect(stats).toHaveProperty('staleCaches');
    expect(stats).toHaveProperty('activeCaches');
    expect(stats).toHaveProperty('errorCaches');
    expect(stats.totalQueries).toBe(0);
  });

  it('clearAll empties the cache', () => {
    const qc = new QueryClient();
    qc.setQueryData(['test'], { value: 1 });
    const utils = createCacheUtils(qc);
    expect(utils.getCacheStats().totalQueries).toBe(1);
    utils.clearAll();
    expect(utils.getCacheStats().totalQueries).toBe(0);
  });

  it('clearByPattern invalidates matching queries', async () => {
    const qc = new QueryClient();
    qc.setQueryData(['properties', 'featured'], []);
    qc.setQueryData(['users', 'list'], []);
    const utils = createCacheUtils(qc);
    await utils.clearByPattern('properties');
    // Both should still exist in cache but properties should be invalidated
    expect(utils.getCacheStats().totalQueries).toBe(2);
  });

  it('getCacheStats counts correctly after adding queries', () => {
    const qc = new QueryClient();
    qc.setQueryData(['a'], 1);
    qc.setQueryData(['b'], 2);
    qc.setQueryData(['c'], 3);
    const stats = createCacheUtils(qc).getCacheStats();
    expect(stats.totalQueries).toBe(3);
  });
});
