import type { UserRole } from '@/hooks/useUserRoles';

/**
 * Resolve the most relevant dashboard route for a given set of roles.
 * Priority is highest-privilege first so users with multiple roles land
 * on the dashboard that surfaces the most actionable widgets for them.
 */
export const resolveDashboardPath = (roles: UserRole[] = []): string => {
  if (!roles || roles.length === 0) return '/dashboard';
  if (roles.includes('super_admin') || roles.includes('admin')) return '/admin-dashboard';
  if (roles.includes('customer_service')) return '/dashboard/customer-service';
  if (roles.includes('agent')) return '/dashboard/agent';
  if (roles.includes('vendor') || roles.includes('service_provider')) return '/dashboard/vendor';
  if (roles.includes('developer')) return '/developer-dashboard';
  if (roles.includes('property_owner')) return '/dashboard/property-owner';
  if (roles.includes('investor')) return '/dashboard/user';
  return '/dashboard';
};

export type DashboardWidgetId =
  | 'saved'
  | 'visits'
  | 'mortgage'
  | 'astra'
  | 'referrals'
  | 'market'
  | 'leads'
  | 'listings'
  | 'commissions'
  | 'bookings'
  | 'services'
  | 'portfolio'
  | 'rentIncome'
  | 'tenants'
  | 'fundPositions'
  | 'roiForecast'
  | 'pipeline'
  | 'support'
  | 'systemHealth'
  | 'moderation';

export const getRoleWidgets = (roles: UserRole[] = []): DashboardWidgetId[] => {
  const set = new Set<DashboardWidgetId>();
  const add = (...ids: DashboardWidgetId[]) => ids.forEach((id) => set.add(id));

  // Baseline (every signed-in user)
  add('saved', 'astra', 'referrals');

  if (roles.includes('agent')) add('leads', 'listings', 'commissions', 'pipeline', 'market');
  if (roles.includes('property_owner')) add('listings', 'rentIncome', 'tenants', 'bookings', 'market');
  if (roles.includes('vendor') || roles.includes('service_provider')) add('services', 'bookings', 'commissions');
  if (roles.includes('developer')) add('listings', 'pipeline', 'market', 'roiForecast');
  if (roles.includes('investor')) add('portfolio', 'fundPositions', 'roiForecast', 'market');
  if (roles.includes('customer_service')) add('support', 'leads');
  if (roles.includes('admin') || roles.includes('super_admin')) add('systemHealth', 'moderation', 'support', 'market');
  if (roles.includes('legal_consultant')) add('services', 'pipeline');

  // Generic users get more discovery-oriented widgets
  if (roles.length === 0 || roles.every((r) => r === 'general_user')) {
    add('visits', 'mortgage', 'market');
  }

  return Array.from(set);
};
