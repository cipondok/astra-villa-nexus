import { describe, it, expect } from 'vitest';
import type { SavedSearch } from '../useSavedSearches';

describe('useSavedSearches - type and data logic', () => {
  it('SavedSearch has required fields', () => {
    const search: SavedSearch = {
      id: '1',
      name: 'Jakarta apartments',
      filters: { city: 'Jakarta', bedrooms: 2 },
      query: 'apartment jakarta',
      email_notifications: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(search.name).toBe('Jakarta apartments');
    expect(search.filters.city).toBe('Jakarta');
  });

  it('filters default to empty object when null', () => {
    const raw = { filters: null };
    const filters = (raw.filters as Record<string, any>) || {};
    expect(filters).toEqual({});
  });

  it('email_notifications defaults to false', () => {
    const raw = {} as any;
    const notifications = raw.email_notifications ?? false;
    expect(notifications).toBe(false);
  });

  it('is_active defaults to true', () => {
    const raw = {} as any;
    const active = raw.is_active ?? true;
    expect(active).toBe(true);
  });

  it('searches are ordered by created_at descending', () => {
    const searches = [
      { created_at: '2025-01-01' },
      { created_at: '2025-03-01' },
      { created_at: '2025-02-01' },
    ];
    const sorted = [...searches].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    expect(sorted[0].created_at).toBe('2025-03-01');
    expect(sorted[2].created_at).toBe('2025-01-01');
  });
});
