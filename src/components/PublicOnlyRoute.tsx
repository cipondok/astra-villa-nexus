
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const PublicOnlyRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return !user ? <Outlet /> : <Navigate to="/" replace />;
};

export default PublicOnlyRoute;
