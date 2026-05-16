import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from './useUserRoles';

export interface RolePermission {
  role: string;
  permission: string;
  description: string | null;
}

/**
 * Fetches all permissions for the current user's active roles.
 * UI-ONLY — all privileged operations are enforced server-side.
 */
export function usePermissions() {
  const { user } = useAuth();
  const { data: roles = [] } = useUserRoles();

  return useQuery({
    queryKey: ['user-permissions', user?.id, roles],
    queryFn: async (): Promise<string[]> => {
      if (!user?.id || roles.length === 0) return [];

      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission')
        .in('role', roles);

      if (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }

      // Deduplicate permissions across multiple roles
      return [...new Set(data?.map((r) => r.permission) || [])];
    },
    enabled: !!user?.id && roles.length > 0,
    staleTime: 60_000,
  });
}

/**
 * Check if the current user has a specific permission.
 */
export function useHasPermission(permission: string) {
  const { data: permissions = [], isLoading } = usePermissions();
  return {
    hasPermission: permissions.includes(permission),
    isLoading,
  };
}

/**
 * Check if the current user has ALL of the specified permissions.
 */
export function useHasAllPermissions(requiredPermissions: string[]) {
  const { data: permissions = [], isLoading } = usePermissions();
  return {
    hasAll: requiredPermissions.every((p) => permissions.includes(p)),
    isLoading,
  };
}

/**
 * Check if the current user has ANY of the specified permissions.
 */
export function useHasAnyPermission(requiredPermissions: string[]) {
  const { data: permissions = [], isLoading } = usePermissions();
  return {
    hasAny: requiredPermissions.some((p) => permissions.includes(p)),
    isLoading,
  };
}

/**
 * Fetch the full role→permission mapping for admin management UI.
 */
export function useAllRolePermissions() {
  return useQuery({
    queryKey: ['all-role-permissions'],
    queryFn: async (): Promise<RolePermission[]> => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('role, permission, description')
        .order('role')
        .order('permission');

      if (error) throw error;
      return (data || []) as RolePermission[];
    },
    staleTime: 60_000,
  });
}
