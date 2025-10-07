
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHasRole } from '@/hooks/useUserRoles';

const VendorOnlyRoute: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasRole: isVendor, isLoading: rolesLoading } = useHasRole('vendor');

  if (authLoading || rolesLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !isVendor) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default VendorOnlyRoute;
