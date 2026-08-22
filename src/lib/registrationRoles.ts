/**
 * Public registration account purposes.
 *
 * Single source of truth for the "What are you joining ASTRA Villa for?" step.
 * Each option maps onto the EXISTING schema:
 *  - `appRole`     -> public.app_role (stored in public.user_roles by handle_new_user)
 *  - `profileType` -> public.profile_type (stored on public.profiles)
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
  label: string;
  description: string;
  icon: LucideIcon;
}

export const REGISTRATION_ROLE_OPTIONS: RegistrationRoleOption[] = [
  {
    value: 'customer',
    appRole: 'general_user',
    profileType: 'buyer',
    label: 'Customer / Buyer / Renter',
    description: 'Search, save, compare, inquire and use property services.',
    icon: Home,
  },
  {
    value: 'property_owner',
    appRole: 'property_owner',
    profileType: 'owner',
    label: 'Property Owner',
    description: 'Register and manage your properties.',
    icon: KeyRound,
  },
  {
    value: 'agent',
    appRole: 'agent',
    profileType: 'agent',
    label: 'Agent / Agency',
    description: 'Manage listings, leads and clients.',
    icon: Users,
  },
  {
    value: 'developer',
    appRole: 'developer',
    profileType: 'developer',
    label: 'Developer',
    description: 'Manage projects, sales and leads.',
    icon: Hammer,
  },
  {
    value: 'vendor',
    appRole: 'vendor',
    profileType: 'vendor',
    label: 'Vendor / Service Provider',
    description: 'Offer property-related services.',
    icon: Store,
  },
  {
    value: 'investor',
    appRole: 'investor',
    profileType: 'investor',
    label: 'Investor',
    description: 'Access investment opportunities, portfolio and analytics.',
    icon: TrendingUp,
  },
];

/** Roles the signup trigger accepts from metadata. Mirrors public.handle_new_user(). */
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
