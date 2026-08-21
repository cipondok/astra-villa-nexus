/**
 * Single source of truth for who may create property listings.
 * Mirrors the server-side `public.has_listing_role()` RLS check.
 */
export const LISTING_ROLES = [
  'agent',
  'property_owner',
  'vendor',
  'developer',
  'admin',
  'super_admin',
] as const;

export type ListingRole = (typeof LISTING_ROLES)[number];

export const isListingRole = (role?: string | null): boolean =>
  !!role && (LISTING_ROLES as readonly string[]).includes(role);

export interface ListingAccessInput {
  isAuthenticated: boolean;
  isAdmin?: boolean;
  roles?: readonly string[];
  profileRole?: string | null;
  isLoading?: boolean;
}

export type ListingAccessState = 'loading' | 'guest' | 'allowed' | 'upgrade_required';

export function getListingAccess({
  isAuthenticated,
  isAdmin = false,
  roles = [],
  profileRole = null,
  isLoading = false,
}: ListingAccessInput): ListingAccessState {
  if (!isAuthenticated) return 'guest';
  if (isLoading) return 'loading';
  if (isAdmin || roles.some(isListingRole) || isListingRole(profileRole)) return 'allowed';
  return 'upgrade_required';
}

export const canCreateListing = (input: ListingAccessInput): boolean =>
  getListingAccess(input) === 'allowed';
