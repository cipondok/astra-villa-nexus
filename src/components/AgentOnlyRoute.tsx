import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHasRole } from '@/hooks/useUserRoles';

const AgentOnlyRoute: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasRole: isAgent, isLoading: rolesLoading } = useHasRole('agent');

  if (authLoading || rolesLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || !isAgent) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AgentOnlyRoute;
