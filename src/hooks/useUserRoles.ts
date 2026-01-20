import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'general_user' | 'property_owner' | 'agent' | 'vendor' | 'admin' | 'customer_service' | 'super_admin' | 'investor' | 'editor';

export const useUserRoles = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return (data?.map((r) => r.role as UserRole) || []) as UserRole[];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // Cache for 30 seconds - shorter for role changes
    refetchOnMount: true, // Always refetch on mount for protected routes
  });
};

export const useHasRole = (role: UserRole) => {
  const { data: roles = [], isLoading } = useUserRoles();
  return {
    hasRole: roles.includes(role),
    isLoading,
  };
};

export const useIsAdmin = () => {
  const { data: roles = [], isLoading } = useUserRoles();
  return {
    isAdmin: roles.includes('admin') || roles.includes('super_admin'),
    isLoading,
  };
};
