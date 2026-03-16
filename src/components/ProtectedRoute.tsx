
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div role="status" aria-live="polite">Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/?auth=true" replace />;
};

export default ProtectedRoute;
