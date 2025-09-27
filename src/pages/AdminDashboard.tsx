
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import EnhancedAdminDashboard from '@/components/admin/EnhancedAdminDashboard';
import AlertMonitoringProvider from '@/components/admin/AlertMonitoringProvider';
import LoadingPage from '@/components/LoadingPage';
import { useDatabaseConnection } from '@/hooks/useDatabaseConnection';

const AdminDashboard = () => {
  const { profile, user } = useAuth();
  const { connectionStatus } = useDatabaseConnection();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AdminDashboard mounted');
    console.log('User:', user);
    console.log('Profile:', profile);
    
    // Remove artificial loading delay - check immediately
    if (user && profile) {
      setIsLoading(false);
    } else {
      // Quick timeout if no user/profile
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, profile]);

  // Check if user is admin or super admin
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';

  console.log('isAdmin:', isAdmin);

  if (isLoading) {
    return (
      <LoadingPage
        message="Loading admin dashboard..."
        showConnectionStatus={true}
        connectionStatus={connectionStatus}
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <Alert className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-gray-900 dark:text-gray-100">
              Admin access required to view this dashboard
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-x-2">
            <a 
              href="/?from=admin"
              className="inline-block bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              Go to Home
            </a>
            <a 
              href="/?auth=true"
              className="inline-block bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              Re-login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AlertMonitoringProvider>
      <EnhancedAdminDashboard />
    </AlertMonitoringProvider>
  );
};

export default AdminDashboard;
