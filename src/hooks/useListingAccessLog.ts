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
 * Logs every /add-property access decision.
 * - Denied attempts (guests included) are sent to the `log-listing-access`
 *   edge function, which re-derives roles server-side and persists them to
 *   `listing_access_logs` with a correlation ID.
 * - Authenticated attempts are additionally recorded in `activity_logs`.
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

    const correlationId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const payload = {
      route,
      access_state: state,
      denial_reason: reason,
      detected_roles: [...roles],
      profile_role: profileRole,
      is_admin: isAdmin,
      correlation_id: correlationId,
      at: new Date().toISOString(),
    };

    console.info('[listing-access]', payload);

    // Server-side authoritative log for denied attempts (guests included).
    if (reason) {
      void supabase.functions
        .invoke('log-listing-access', {
          body: { correlation_id: correlationId, route, access_state: state },
        })
        .then(({ error }) => {
          if (error) console.warn('[listing-access] server log failed:', error.message);
        });
    }

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

