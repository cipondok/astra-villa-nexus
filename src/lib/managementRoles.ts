import type { UserRole } from '@/hooks/useUserRoles';

/**
 * Roles allowed to access the property management area (/my-properties).
 * UI-only gate — data access is still enforced by RLS.
 */
export const MANAGEMENT_ROLES: readonly UserRole[] = [
  'agent',
  'property_owner',
  'developer',
  'admin',
  'super_admin',
];

export const canManageProperties = (roles: readonly string[] = []) =>
  roles.some((r) => (MANAGEMENT_ROLES as readonly string[]).includes(r));

/** True when the current path is the management area or any of its sub-routes. */
export const isManagementPath = (pathname: string) =>
  pathname === '/my-properties' || pathname.startsWith('/my-properties/');
