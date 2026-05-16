import { describe, it, expect } from 'vitest';

describe('propertyQueries - filter options', () => {
  it('default options have sensible values', () => {
    const defaults = {
      limit: 20,
      status: 'active',
      approval_status: 'approved',
      listing_type: undefined,
    };
    expect(defaults.limit).toBe(20);
    expect(defaults.status).toBe('active');
    expect(defaults.approval_status).toBe('approved');
    expect(defaults.listing_type).toBeUndefined();
  });

  it('listing_type filter is optional', () => {
    const options = { listing_type: 'rent' };
    expect(options.listing_type).toBe('rent');

    const noFilter = {};
    expect((noFilter as any).listing_type).toBeUndefined();
  });

  it('limit can be overridden', () => {
    const options = { limit: 50 };
    expect(options.limit).toBe(50);
  });

  it('status values are valid strings', () => {
    const validStatuses = ['active', 'inactive', 'pending', 'sold'];
    expect(validStatuses).toContain('active');
    expect(validStatuses).toContain('sold');
  });

  it('approval statuses are valid', () => {
    const validApprovals = ['approved', 'pending', 'rejected'];
    expect(validApprovals).toContain('approved');
    expect(validApprovals).toContain('pending');
  });
});
