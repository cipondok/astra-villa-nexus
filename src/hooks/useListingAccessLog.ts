import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ListingAccessState } from '@/lib/listingAccess';

export interface ListingAccessLogInput {
  state: ListingAccessState;
  userId?: string | null;
  roles?: readonly string[];
  profileRole?: string | null;
  isAdmin?: boolean;
  route?: string;
}

export function denialReason({
  state,
  roles = [],
  profileRole,
}: Pick<ListingAccessLogInput, 'state' | 'roles' | 'profileRole'>): string | null {
  if (state === 'allowed') return null;
  if (state === 'guest') return 'not_authenticated';
  if (state === 'loading') return null;
  if (roles.length === 0 && !profileRole) return 'no_roles_assigned';
  return 'role_not_permitted';
}

/**
 * Logs every /add-property access decision. Authenticated attempts are
 * persisted to activity_logs (RLS: user_id must equal auth.uid()); guest
 * attempts are console-only since they cannot write rows.
 */
export function useListingAccessLog({
  state,
  userId,
  roles = [],
  profileRole = null,
  isAdmin = false,
  route = '/add-property',
}: ListingAccessLogInput) {
  const lastLogged = useRef<string | null>(null);

  useEffect(() => {
    if (state === 'loading') return;

    const reason = denialReason({ state, roles, profileRole });
    const signature = `${userId ?? 'guest'}|${state}|${roles.join(',')}|${profileRole ?? ''}`;
    if (lastLogged.current === signature) return;
    lastLogged.current = signature;

    const payload = {
      route,
      access_state: state,
      denial_reason: reason,
      detected_roles: [...roles],
      profile_role: profileRole,
      is_admin: isAdmin,
      at: new Date().toISOString(),
    };

    console.info('[listing-access]', payload);

    if (!userId) return;

    void supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        activity_type: state === 'allowed' ? 'listing_access_granted' : 'listing_access_denied',
        activity_description:
          state === 'allowed'
            ? `Access granted to ${route}`
            : `Access denied to ${route} (${reason})`,
        metadata: payload,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      })
      .then(({ error }) => {
        if (error) console.warn('[listing-access] log failed:', error.message);
      });
  }, [state, userId, roles, profileRole, isAdmin, route]);
}
