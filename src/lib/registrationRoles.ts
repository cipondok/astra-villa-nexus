/**
 * Public registration account purposes.
 *
 * Single source of truth for the "What are you joining ASTRA Villa for?" step.
 * Each option maps onto the EXISTING schema:
 *  - `appRole`     -> sent as the signup `role` hint. public.handle_new_user() grants
 *                     only `investor` or `general_user`; owner/agent/developer/vendor
 *                     are kept as a profile_type hint and need an admin-approved
 *                     application (see src/lib/listerOnboarding.ts).
 *  - `profileType` -> public.profile_type (stored on public.profiles)
 *  - `requiresReview` -> true when the purpose needs an approved application
 *
 * Privileged roles (admin, super_admin, customer_service, legal_consultant, editor)
 * are intentionally NOT offered publicly — they are assigned internally only.
 */
import { Home, KeyRound, Users, Hammer, Store, TrendingUp, type LucideIcon } from 'lucide-react';
import type { UserRole } from '@/hooks/useUserRoles';

export type RegistrationPurpose =
  | 'customer'
  | 'property_owner'
  | 'agent'
  | 'developer'
  | 'vendor'
  | 'investor';

export interface RegistrationRoleOption {
  value: RegistrationPurpose;
  appRole: UserRole;
  profileType: string;
  requiresReview: boolean;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const REGISTRATION_ROLE_OPTIONS: RegistrationRoleOption[] = [
  {
    value: 'customer',
    appRole: 'general_user',
    profileType: 'buyer',
    requiresReview: false,
    label: 'Customer / Buyer / Renter',
    description: 'Search, save, compare, inquire and use property services.',
    icon: Home,
  },
  {
    value: 'property_owner',
    appRole: 'property_owner',
    profileType: 'owner',
    requiresReview: true,
    label: 'Property Owner',
    description: 'Register and manage your properties.',
    icon: KeyRound,
  },
  {
    value: 'agent',
    appRole: 'agent',
    profileType: 'agent',
    requiresReview: true,
    label: 'Agent / Agency',
    description: 'Manage listings, leads and clients.',
    icon: Users,
  },
  {
    value: 'developer',
    appRole: 'developer',
    profileType: 'developer',
    requiresReview: true,
    label: 'Developer',
    description: 'Manage projects, sales and leads.',
    icon: Hammer,
  },
  {
    value: 'vendor',
    appRole: 'vendor',
    profileType: 'vendor',
    requiresReview: true,
    label: 'Vendor / Service Provider',
    description: 'Offer property-related services.',
    icon: Store,
  },
  {
    value: 'investor',
    appRole: 'investor',
    profileType: 'investor',
    requiresReview: false,
    label: 'Investor',
    description: 'Access investment opportunities, portfolio and analytics.',
    icon: TrendingUp,
  },
];

/**
 * Purpose hints the signup trigger accepts from metadata. Mirrors public.handle_new_user():
 * only `investor` becomes a role at signup; the others are stored as profile_type hints.
 */
export const PUBLIC_SIGNUP_ROLES: readonly string[] = [
  'general_user',
  'property_owner',
  'agent',
  'vendor',
  'developer',
  'investor',
];

export const getRegistrationRole = (
  purpose?: string | null,
): RegistrationRoleOption | undefined =>
  REGISTRATION_ROLE_OPTIONS.find((o) => o.value === purpose);

/** Safe mapping to an app_role that the signup trigger will honour. */
export const toSignupRole = (purpose?: string | null): UserRole => {
  const opt = getRegistrationRole(purpose);
  if (!opt || !PUBLIC_SIGNUP_ROLES.includes(opt.appRole)) return 'general_user';
  return opt.appRole;
};

export const toProfileType = (purpose?: string | null): string =>
  getRegistrationRole(purpose)?.profileType ?? 'buyer';

/** Purposes whose listing/vendor role is granted only after admin review. */
export const purposeRequiresReview = (purpose?: string | null): boolean =>
  getRegistrationRole(purpose)?.requiresReview ?? false;
