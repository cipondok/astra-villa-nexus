import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import VendorAnalytics from '@/components/vendor/VendorAnalytics';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

const Analytics = () => {
  const { user, profile } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access analytics
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show different analytics based on user role
  if (profile?.role === 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <AnalyticsDashboard />
      </div>
    );
  }

  if (profile?.role === 'vendor') {
    return (
      <div className="container mx-auto px-4 py-8">
        <VendorAnalytics />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Analytics access is limited to vendors and administrators
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default Analytics;