
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import AdvancedAdminDashboard from '@/components/admin/AdvancedAdminDashboard';

const AdminDashboard = () => {
  const { profile, user, loading } = useAuth();

  console.log('AdminDashboard - Auth state:', { 
    user: !!user, 
    profile: !!profile, 
    userEmail: user?.email,
    profileRole: profile?.role,
    loading 
  });

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Check if user is admin or super admin
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';

  console.log('AdminDashboard - Admin check:', { isAdmin, profileRole: profile?.role, userEmail: user?.email });

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Admin access required to view this dashboard. Current role: {profile?.role || 'No role assigned'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <AdvancedAdminDashboard />;
};

export default AdminDashboard;
