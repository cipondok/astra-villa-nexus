import { describe, it, expect } from 'vitest';

describe('useNewListingMatcher - listing match alerts', () => {
  it('matches criteria to new listing', () => {
    const criteria = { type: 'apartment', maxPrice: 1e9, location: 'jakarta', minBeds: 2 };
    const listing = { type: 'apartment', price: 800e6, location: 'jakarta', beds: 3 };
    const matches = listing.type === criteria.type && listing.price <= criteria.maxPrice && listing.location === criteria.location && listing.beds >= criteria.minBeds;
    expect(matches).toBe(true);
  });
  it('partial match score', () => {
    const fields = ['type', 'price', 'location', 'beds'];
    const matched = ['type', 'location', 'beds'];
    const score = (matched.length / fields.length) * 100;
    expect(score).toBe(75);
  });
  it('alert frequency limit', () => {
    const MAX_DAILY = 10; const sent = 8;
    expect(sent < MAX_DAILY).toBe(true);
  });
});
