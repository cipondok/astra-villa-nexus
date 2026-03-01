import { describe, it, expect } from 'vitest';
import { getCacheHeaders, getEndpointCacheStrategy } from '../cacheHeaders';

describe('getCacheHeaders', () => {
  it('returns no-store for no-cache strategy', () => {
    const headers = getCacheHeaders('no-cache');
    expect(headers['Cache-Control']).toContain('no-store');
    expect(headers['Cache-Control']).toContain('private');
  });

  it('returns short cache with stale-while-revalidate', () => {
    const headers = getCacheHeaders('short');
    expect(headers['Cache-Control']).toContain('max-age=60');
    expect(headers['Cache-Control']).toContain('stale-while-revalidate=30');
    expect(headers['Cache-Control']).toContain('private');
  });

  it('returns public for long strategy', () => {
    const headers = getCacheHeaders('long');
    expect(headers['Cache-Control']).toContain('public');
    expect(headers['Cache-Control']).toContain('max-age=3600');
  });

  it('returns immutable for immutable strategy', () => {
    const headers = getCacheHeaders('immutable');
    expect(headers['Cache-Control']).toContain('immutable');
    expect(headers['Cache-Control']).toContain('max-age=31536000');
  });

  it('returns medium cache settings', () => {
    const headers = getCacheHeaders('medium');
    expect(headers['Cache-Control']).toContain('max-age=300');
  });

  it('returns static cache with 1 day max-age', () => {
    const headers = getCacheHeaders('static');
    expect(headers['Cache-Control']).toContain('max-age=86400');
    expect(headers['Cache-Control']).toContain('public');
  });
});

describe('getEndpointCacheStrategy', () => {
  it('returns configured strategy for known endpoint', () => {
    expect(getEndpointCacheStrategy('login-rate-limiter')).toBe('no-cache');
    expect(getEndpointCacheStrategy('get-trending-searches')).toBe('medium');
    expect(getEndpointCacheStrategy('algorithm-analytics')).toBe('long');
  });

  it('defaults to no-cache for unknown endpoint', () => {
    expect(getEndpointCacheStrategy('unknown-endpoint')).toBe('no-cache');
  });
});
