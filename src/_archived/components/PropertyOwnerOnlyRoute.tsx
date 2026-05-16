import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHasRole } from '@/hooks/useUserRoles';

const PropertyOwnerOnlyRoute: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasRole: isPropertyOwner, isLoading: rolesLoading } = useHasRole('property_owner');

  if (authLoading || rolesLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || !isPropertyOwner) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PropertyOwnerOnlyRoute;
