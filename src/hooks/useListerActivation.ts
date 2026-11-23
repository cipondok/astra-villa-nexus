import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { getActivationState, type ActivationState, type ApplicationSummary } from '@/lib/listerOnboarding';
import { getReviewInfo } from '@/lib/listingReview';

export interface ListerCounts {
  listings: number;
  live: number;
  inReview: number;
  needsChanges: number;
  newLeads: number;
}

/**
 * Owner/agent activation status for the signed-in user, built from the
 * user's own rows only (RLS scopes every query below to auth.uid()).
 * UI only: listing permission itself is enforced in the database.
 */
export function useListerActivation() {
  const { user } = useAuth();
  const rolesQuery = useUserRoles();

  const appsQuery = useQuery({
    queryKey: ['lister-applications', user?.id],
    enabled: !!user?.id,
    staleTime: 15_000,
    queryFn: async () => {
      const uid = user!.id;
      const [owner, agent, profile] = await Promise.all([
        supabase
          .from('property_owner_requests')
          .select('status, created_at, reviewed_at, review_notes')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('agent_registration_requests')
          .select('status, created_at, reviewed_at, review_notes, business_type')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('profiles').select('profile_type').eq('id', uid).maybeSingle(),
      ]);
      if (owner.error) throw owner.error;
      if (agent.error) throw agent.error;
      const applications: ApplicationSummary[] = [
        ...(owner.data || []).map((r) => ({ ...r, type: 'property_owner' as const })),
        ...(agent.data || []).map((r) => ({ ...r, type: 'agent' as const })),
      ];
      return { applications, profileType: (profile.data?.profile_type as string | null) ?? null };
    },
  });

  const state: ActivationState | null =
    rolesQuery.isLoading || appsQuery.isLoading || !user
      ? null
      : getActivationState({
          roles: rolesQuery.data || [],
          applications: appsQuery.data?.applications || [],
          profileType: appsQuery.data?.profileType,
        });

  const countsQuery = useQuery({
    queryKey: ['lister-counts', user?.id],
    enabled: !!user?.id && state?.stage === 'active',
    staleTime: 30_000,
    queryFn: async (): Promise<ListerCounts> => {
      const uid = user!.id;
      const [props, leads] = await Promise.all([
        supabase
          .from('properties')
          .select('id, approval_status, status, is_demo, meta')
          .or(`owner_id.eq.${uid},agent_id.eq.${uid}`)
          .limit(500),
        supabase
          .from('property_leads')
          .select('id', { count: 'exact', head: true })
          .eq('agent_id', uid)
          .eq('status', 'new'),
      ]);
      if (props.error) throw props.error;
      const rows = (props.data || []).filter((p) => !p.is_demo);
      const keys = rows.map((p) => getReviewInfo(p as never).key);
      return {
        listings: rows.length,
        live: keys.filter((k) => k === 'live').length,
        inReview: keys.filter((k) => k === 'pending').length,
        needsChanges: keys.filter((k) => k === 'revision' || k === 'rejected').length,
        newLeads: leads.count ?? 0,
      };
    },
  });

  return {
    state,
    isLoading: !!user && state === null,
    isError: appsQuery.isError,
    counts: countsQuery.data ?? null,
    refetch: () => Promise.all([rolesQuery.refetch(), appsQuery.refetch()]),
  };
}
