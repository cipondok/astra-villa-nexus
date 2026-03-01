import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MembershipLevel, getMembershipFromUserLevel } from '@/types/membership';
import { useUserRoles } from '@/hooks/useUserRoles';

interface UserMembershipData {
  membershipLevel: MembershipLevel;
  verificationStatus: string;
  userLevelName: string | null;
  userLevelId: string | null;
  maxProperties: number;
  maxListings: number;
  canFeatureListings: boolean;
  prioritySupport: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useUserMembership(userId?: string): UserMembershipData {
  const { user, profile } = useAuth();
  const { data: roles = [] } = useUserRoles();
  const targetUserId = userId || user?.id;

  const isAdmin = roles.includes('admin') || roles.includes('super_admin');

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-membership', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          verification_status,
          user_level_id,
          user_levels (
            id,
            name,
            max_properties,
            max_listings,
            can_feature_listings,
            priority_support,
            description
          )
        `)
        .eq('id', targetUserId)
        .single();

      if (profileError) throw profileError;
      return profileData;
    },
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const userLevel = data?.user_levels 
    ? (Array.isArray(data.user_levels) ? data.user_levels[0] : data.user_levels)
    : null;

  // Admins get VIP Investor level by default
  const membershipLevel: MembershipLevel = isAdmin && !userLevel?.name 
    ? 'vip_investor' 
    : getMembershipFromUserLevel(userLevel?.name);

  return {
    membershipLevel,
    verificationStatus: isAdmin ? 'verified' : (data?.verification_status || profile?.verification_status || 'pending'),
    userLevelName: isAdmin && !userLevel?.name ? 'VIP Investor' : (userLevel?.name || null),
    userLevelId: data?.user_level_id || null,
    maxProperties: isAdmin ? 999 : (userLevel?.max_properties || 5),
    maxListings: isAdmin ? 999 : (userLevel?.max_listings || 10),
    canFeatureListings: isAdmin ? true : (userLevel?.can_feature_listings || false),
    prioritySupport: isAdmin ? true : (userLevel?.priority_support || false),
    isLoading,
    error: error as Error | null
  };
}

export function useUserMembershipById(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-membership-by-id', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          verification_status,
          user_level_id,
          user_levels (
            name
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      const userLevel = data?.user_levels 
        ? (Array.isArray(data.user_levels) ? data.user_levels[0] : data.user_levels)
        : null;

      return {
        ...data,
        membershipLevel: getMembershipFromUserLevel(userLevel?.name)
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export default useUserMembership;
