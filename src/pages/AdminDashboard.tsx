
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import AdvancedAdminDashboard from '@/components/admin/AdvancedAdminDashboard';

const AdminDashboard = () => {
  const { profile, user } = useAuth();

  // Check if user is admin or super admin
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Admin access required to view this dashboard
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <AdvancedAdminDashboard />;
};

export default AdminDashboard;
