
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useUserRoles';

/**
 * UI-ONLY route guard — prevents non-admin users from seeing admin pages.
 * Actual data protection is enforced by RLS policies and edge function auth.
 */
const AdminOnlyRoute: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: rolesLoading } = useIsAdmin();

  if (authLoading || rolesLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminOnlyRoute;
