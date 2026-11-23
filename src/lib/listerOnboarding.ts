/**
 * Owner / agent / developer onboarding rules.
 *
 * Single source of truth for the "join as a lister" journey:
 *  - which roles a person can apply for and which existing table stores the
 *    application (`property_owner_requests` or `agent_registration_requests`),
 *  - validation of the application form,
 *  - which profile fields may appear publicly and which stay private,
 *  - the activation state shown on Profile → Roles and the dashboard.
 *
 * Listing roles are granted ONLY by the database when an admin approves an
 * application (public.grant_role_on_approval). Nothing here grants a role.
 */

export type ListerRole = 'property_owner' | 'agent' | 'developer';
export const LISTER_ROLES: readonly ListerRole[] = ['property_owner', 'agent', 'developer'];

export type OwnerType = 'individual' | 'business';
export type AgentKind = 'individual_agent' | 'agency';

export const OWNER_PROPERTY_TYPES = ['house', 'villa', 'apartment', 'land', 'commercial'] as const;
export const OWNER_PROPERTY_COUNTS = ['1', '2-5', '6-20', '20+'] as const;

export interface ListerApplicationInput {
  role: ListerRole | null;
  fullName: string;
  phone: string;
  email: string;
  ownerType: OwnerType;
  agentKind: AgentKind;
  companyName: string;
  licenseNumber: string;
  province: string;
  city: string;
  area: string;
  yearsExperience: string;
  bio: string;
  propertyTypes: string[];
  propertyCount: string;
  declaration: boolean;
}

export const emptyListerApplication = (seed: Partial<ListerApplicationInput> = {}): ListerApplicationInput => ({
  role: null,
  fullName: '',
  phone: '',
  email: '',
  ownerType: 'individual',
  agentKind: 'individual_agent',
  companyName: '',
  licenseNumber: '',
  province: '',
  city: '',
  area: '',
  yearsExperience: '',
  bio: '',
  propertyTypes: [],
  propertyCount: '1',
  declaration: false,
  ...seed,
});

export type ListerField = keyof ListerApplicationInput;
export type ListerErrorKey =
  | 'required'
  | 'tooShort'
  | 'tooLong'
  | 'invalidPhone'
  | 'invalidEmail'
  | 'invalidNumber'
  | 'declaration'
  | 'pickOne';

export const BIO_MIN_PROFESSIONAL = 40;
export const BIO_MAX = 1000;

/** Normalises an Indonesian mobile/landline number to +62…, or returns null when invalid. */
export function normalizeIndonesianPhone(raw: string): string | null {
  const cleaned = (raw || '').replace(/[\s().-]/g, '');
  if (!/^\+?\d+$/.test(cleaned)) return null;
  let digits = cleaned.replace(/^\+/, '');
  if (digits.startsWith('62')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  else return null;
  if (digits.startsWith('0')) return null;
  if (digits.length < 8 || digits.length > 13) return null;
  return `+62${digits}`;
}

/** Company name is required for agencies, developers and business owners. */
export function requiresCompany(input: Pick<ListerApplicationInput, 'role' | 'agentKind' | 'ownerType'>): boolean {
  if (input.role === 'developer') return true;
  if (input.role === 'agent') return input.agentKind === 'agency';
  if (input.role === 'property_owner') return input.ownerType === 'business';
  return false;
}

/** Agents and developers must describe their work; owners may skip the bio. */
export const requiresBio = (role: ListerRole | null): boolean => role === 'agent' || role === 'developer';

export function validateListerApplication(input: ListerApplicationInput): Partial<Record<ListerField, ListerErrorKey>> {
  const errors: Partial<Record<ListerField, ListerErrorKey>> = {};
  const text = (v: string) => (v || '').trim();

  if (!input.role || !LISTER_ROLES.includes(input.role)) errors.role = 'pickOne';

  const name = text(input.fullName);
  if (!name) errors.fullName = 'required';
  else if (name.length < 3) errors.fullName = 'tooShort';
  else if (name.length > 100) errors.fullName = 'tooLong';

  if (!text(input.phone)) errors.phone = 'required';
  else if (!normalizeIndonesianPhone(input.phone)) errors.phone = 'invalidPhone';

  const email = text(input.email);
  if (!email) errors.email = 'required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) errors.email = 'invalidEmail';

  const company = text(input.companyName);
  if (requiresCompany(input) && !company) errors.companyName = 'required';
  else if (company.length > 150) errors.companyName = 'tooLong';

  if (text(input.licenseNumber).length > 60) errors.licenseNumber = 'tooLong';

  if (!text(input.province)) errors.province = 'required';
  else if (text(input.province).length > 80) errors.province = 'tooLong';
  if (!text(input.city)) errors.city = 'required';
  else if (text(input.city).length > 80) errors.city = 'tooLong';
  if (text(input.area).length > 120) errors.area = 'tooLong';

  const years = text(input.yearsExperience);
  if (years && (!/^\d{1,2}$/.test(years) || Number(years) > 70)) errors.yearsExperience = 'invalidNumber';

  const bio = text(input.bio);
  if (requiresBio(input.role) && !bio) errors.bio = 'required';
  else if (requiresBio(input.role) && bio.length < BIO_MIN_PROFESSIONAL) errors.bio = 'tooShort';
  else if (bio.length > BIO_MAX) errors.bio = 'tooLong';

  if (input.role === 'property_owner' && input.propertyTypes.length === 0) errors.propertyTypes = 'pickOne';

  if (!input.declaration) errors.declaration = 'declaration';
  return errors;
}

const orNull = (v: string) => (v || '').trim() || null;

/** Fields written to the applicant's own (private) profile row. */
export function buildProfileUpdate(input: ListerApplicationInput) {
  return {
    full_name: input.fullName.trim(),
    phone: normalizeIndonesianPhone(input.phone),
    company_name: orNull(input.companyName),
    license_number: input.role === 'property_owner' ? undefined : orNull(input.licenseNumber),
    years_experience: orNull(input.yearsExperience),
    bio: orNull(input.bio),
  };
}

export const formatServiceArea = (input: Pick<ListerApplicationInput, 'area' | 'city' | 'province'>): string =>
  [input.area, input.city, input.province].map((v) => (v || '').trim()).filter(Boolean).join(', ');

/** Row for the existing `property_owner_requests` table. Status is always set by the database. */
export function buildOwnerRequest(input: ListerApplicationInput, userId: string) {
  return {
    user_id: userId,
    full_name: input.fullName.trim(),
    phone: normalizeIndonesianPhone(input.phone),
    owner_type: input.ownerType,
    property_types: input.propertyTypes,
    property_count: input.propertyCount,
    province: input.province.trim(),
    city: input.city.trim(),
    area: orNull(input.area),
    business_name: input.ownerType === 'business' ? orNull(input.companyName) : null,
    additional_notes: orNull(input.bio),
  };
}

/** Row for the existing `agent_registration_requests` table (agents and developers). */
export function buildAgentRequest(input: ListerApplicationInput, userId: string) {
  return {
    user_id: userId,
    full_name: input.fullName.trim(),
    email: input.email.trim(),
    phone: normalizeIndonesianPhone(input.phone),
    business_type: input.role === 'developer' ? 'developer' : input.agentKind,
    company_name: orNull(input.companyName),
    license_number: orNull(input.licenseNumber),
    service_area: formatServiceArea(input),
  };
}

export const applicationTable = (role: ListerRole) =>
  role === 'property_owner' ? 'property_owner_requests' : 'agent_registration_requests';

/** Who can see each onboarding field, based on the current database rules. */
export type FieldVisibility = 'public' | 'private';
export const FIELD_VISIBILITY: Record<'fullName' | 'companyName' | 'phone' | 'email' | 'licenseNumber' | 'serviceArea' | 'yearsExperience' | 'bio', FieldVisibility> = {
  fullName: 'public',
  companyName: 'public',
  phone: 'private',
  email: 'private',
  licenseNumber: 'private',
  serviceArea: 'private',
  yearsExperience: 'private',
  bio: 'private',
};

/* ---------------- Activation state ---------------- */

export interface ApplicationSummary {
  type: 'property_owner' | 'agent' | 'vendor';
  status: string;
  created_at: string;
  reviewed_at?: string | null;
  review_notes?: string | null;
  business_type?: string | null;
}

export type ActivationState =
  | { stage: 'active'; role: ListerRole | 'admin' }
  | { stage: 'pending'; role: ListerRole; submittedAt: string }
  | { stage: 'rejected'; role: ListerRole; note: string | null; reviewedAt: string | null }
  | { stage: 'not_started'; intent: ListerRole | null };

const PROFILE_TYPE_INTENT: Record<string, ListerRole> = {
  owner: 'property_owner',
  agent: 'agent',
  developer: 'developer',
};

export const applicationRole = (app: ApplicationSummary): ListerRole | null => {
  if (app.type === 'property_owner') return 'property_owner';
  if (app.type === 'agent') return app.business_type === 'developer' ? 'developer' : 'agent';
  return null;
};

export function getActivationState(params: {
  roles: readonly string[];
  applications: readonly ApplicationSummary[];
  profileType?: string | null;
}): ActivationState {
  const { roles, applications, profileType } = params;
  for (const r of ['agent', 'developer', 'property_owner'] as const) {
    if (roles.includes(r)) return { stage: 'active', role: r };
  }
  if (roles.includes('admin') || roles.includes('super_admin')) return { stage: 'active', role: 'admin' };

  const listerApps = applications
    .filter((a) => applicationRole(a))
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const open = listerApps.find((a) => a.status === 'pending' || a.status === 'under_review');
  if (open) return { stage: 'pending', role: applicationRole(open)!, submittedAt: open.created_at };

  const latest = listerApps[0];
  if (latest && latest.status === 'rejected') {
    return {
      stage: 'rejected',
      role: applicationRole(latest)!,
      note: latest.review_notes?.trim() || null,
      reviewedAt: latest.reviewed_at ?? null,
    };
  }
  return { stage: 'not_started', intent: (profileType && PROFILE_TYPE_INTENT[profileType]) || null };
}

/** Maps a database error from submitting an application to a translation key. */
export function applicationErrorKey(error: { message?: string; code?: string } | null | undefined): 'alreadyPending' | 'generic' {
  return error?.message?.includes('application_already_pending') ? 'alreadyPending' : 'generic';
}
