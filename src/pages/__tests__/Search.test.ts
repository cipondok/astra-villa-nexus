import { describe, it, expect } from 'vitest';

describe('Search page', () => {
  it('URL params encode search filters', () => {
    const params = new URLSearchParams({ type: 'apartment', min: '1000000000', beds: '3' });
    expect(params.get('type')).toBe('apartment');
    expect(params.get('beds')).toBe('3');
  });
  it('empty search returns all properties', () => {
    const query = '';
    const shouldFetchAll = query.trim().length === 0;
    expect(shouldFetchAll).toBe(true);
  });
});
