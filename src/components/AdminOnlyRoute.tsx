
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AdminOnlyRoute: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !profile || (profile.role !== 'admin' && !profile.is_admin)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminOnlyRoute;
