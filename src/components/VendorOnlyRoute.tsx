
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const VendorOnlyRoute: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !profile || (profile.role !== 'vendor' && profile.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default VendorOnlyRoute;
