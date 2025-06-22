
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import AdvancedAdminDashboard from '@/components/admin/AdvancedAdminDashboard';

const AdminDashboard = () => {
  const { profile, user, loading, isAuthenticated } = useAuth();

  console.log('AdminDashboard - Full Auth state:', { 
    user: !!user, 
    profile: !!profile, 
    userEmail: user?.email,
    profileRole: profile?.role,
    loading,
    isAuthenticated
  });

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-lg">Loading Admin Dashboard...</div>
          <div className="text-sm text-gray-500 mt-2">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // If not authenticated at all, show different message
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user is admin or super admin
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';

  console.log('AdminDashboard - Admin check result:', { 
    isAdmin, 
    profileRole: profile?.role, 
    userEmail: user?.email,
    isSuperAdmin: user?.email === 'mycode103@gmail.com'
  });

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Admin access required to view this dashboard. 
            <br />
            Current role: {profile?.role || 'No role assigned'}
            <br />
            Email: {user?.email || 'No email'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log('AdminDashboard - Rendering AdvancedAdminDashboard');
  return <AdvancedAdminDashboard />;
};

export default AdminDashboard;
