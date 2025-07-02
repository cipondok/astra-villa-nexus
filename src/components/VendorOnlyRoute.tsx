
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const VendorOnlyRoute: React.FC = () => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !profile || profile.role !== 'vendor') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default VendorOnlyRoute;
