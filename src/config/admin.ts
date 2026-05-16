// Admin email allowlist — mirrors the public.admin_users table.
// Kept here so the UI can fail fast before hitting Supabase.
export const ADMIN_EMAILS = [
  "astravillarealty@gmail.com",
] as const;

export function isAllowlistedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase() as (typeof ADMIN_EMAILS)[number]);
}
