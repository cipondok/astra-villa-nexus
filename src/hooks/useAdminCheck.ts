import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { isValidUUID } from '@/utils/uuid-validation';

export const useAdminCheck = () => {
  const { user, profile } = useAuth();

  // Use server-side admin check function with UUID validation
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      // Validate UUID before making RPC call
      if (!user?.id || !isValidUUID(user.id)) {
        console.warn('Invalid or missing user ID for admin check');
        return false;
      }

      const { data, error } = await supabase.rpc('is_admin_user');
      
      if (error) {
        console.error('Admin check error:', error);
        return false;
      }

      return data === true;
    },
    // Only enable when we have a valid UUID
    enabled: !!user?.id && isValidUUID(user.id),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once to avoid repeated invalid UUID attempts
  });

  return {
    isAdmin: isAdmin ?? false,
    isLoading,
    userRole: profile?.role,
  };
};
