/**
 * Wrapper component that mounts expensive auth-dependent hooks
 * only when a user is actually logged in.
 * This avoids setting up realtime subscriptions and DB queries
 * for anonymous visitors on every page load.
 */
import { useAuth } from '@/contexts/AuthContext';
import { useVIPNotifications } from '@/hooks/useVIPNotifications';
import { usePropertyAlerts } from '@/hooks/usePropertyAlerts';
import { useNewListingMatcher } from '@/hooks/useNewListingMatcher';

const AuthenticatedHooksInner = () => {
  useVIPNotifications();
  usePropertyAlerts();
  useNewListingMatcher();
  return null;
};

export const AuthenticatedHooks = () => {
  const { user } = useAuth();
  if (!user) return null;
  return <AuthenticatedHooksInner />;
};

export default AuthenticatedHooks;
