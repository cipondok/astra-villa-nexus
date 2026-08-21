import { describe, it, expect } from 'vitest';
import { getListingAccess, canCreateListing, LISTING_ROLES } from '../listingAccess';

describe('/add-property access control', () => {
  it('blocks guests regardless of roles', () => {
    expect(getListingAccess({ isAuthenticated: false })).toBe('guest');
    expect(getListingAccess({ isAuthenticated: false, roles: ['agent'] })).toBe('guest');
  });

  it.each(LISTING_ROLES)('allows role "%s" from user_roles', (role) => {
    expect(canCreateListing({ isAuthenticated: true, roles: [role] })).toBe(true);
  });

  it.each(LISTING_ROLES)('allows role "%s" from legacy profile.role', (role) => {
    expect(canCreateListing({ isAuthenticated: true, profileRole: role })).toBe(true);
  });

  it('blocks authenticated users without a listing role', () => {
    expect(getListingAccess({ isAuthenticated: true, roles: ['general_user'] })).toBe(
      'upgrade_required',
    );
    expect(getListingAccess({ isAuthenticated: true, roles: [] })).toBe('upgrade_required');
    expect(
      getListingAccess({ isAuthenticated: true, roles: ['investor'], profileRole: 'investor' }),
    ).toBe('upgrade_required');
  });

  it('allows admins even with no role rows', () => {
    expect(canCreateListing({ isAuthenticated: true, isAdmin: true })).toBe(true);
  });

  it('waits while roles are loading instead of denying', () => {
    expect(getListingAccess({ isAuthenticated: true, isLoading: true })).toBe('loading');
  });

  it('allows when any of several roles qualifies', () => {
    expect(
      canCreateListing({ isAuthenticated: true, roles: ['general_user', 'property_owner'] }),
    ).toBe(true);
  });
});
