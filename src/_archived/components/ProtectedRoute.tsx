
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div role="status" aria-live="polite">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/?auth=true" replace />;
  }

  return (
    <>
      <EmailVerificationBanner />
      <Outlet />
    </>
  );
};

export default ProtectedRoute;
