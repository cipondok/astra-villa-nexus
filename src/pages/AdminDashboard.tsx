
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdvancedAdminDashboard from '@/components/admin/AdvancedAdminDashboard';
import AlertMonitoringProvider from '@/components/admin/AlertMonitoringProvider';
import LoadingPage from '@/components/LoadingPage';
import { useDatabaseConnection } from '@/hooks/useDatabaseConnection';

const AdminDashboard = () => {
  const { profile, user } = useAuth();
  const { connectionStatus } = useDatabaseConnection();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AdminDashboard mounted');
    console.log('User:', user);
    console.log('Profile:', profile);
    
    // Quick loading timeout to prevent hanging
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Reduced to 1.5 seconds

    return () => clearTimeout(timer);
  }, [user, profile]);

  // Check if user is admin or super admin
  const isAdmin = profile?.role === 'admin' || user?.email === 'mycode103@gmail.com';

  console.log('isAdmin:', isAdmin);

  if (isLoading) {
    return (
      <LoadingPage
        message="Initializing admin dashboard..."
        showConnectionStatus={true}
        connectionStatus={connectionStatus}
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background dark:bg-slate-900 text-foreground dark:text-slate-100 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <Alert className="bg-card dark:bg-slate-800 border-border dark:border-slate-700">
            <AlertTriangle className="h-4 w-4 text-destructive dark:text-red-400" />
            <AlertDescription className="text-foreground dark:text-slate-200">
              Admin access required to view this dashboard
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-x-2">
            <button 
              onClick={() => navigate('/dashboard', { replace: true })}
              className="bg-primary dark:bg-blue-600 text-primary-foreground dark:text-white px-4 py-2 rounded hover:bg-primary/90 dark:hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => navigate('/?auth=true', { replace: true })}
              className="bg-secondary dark:bg-slate-700 text-secondary-foreground dark:text-slate-200 px-4 py-2 rounded hover:bg-secondary/90 dark:hover:bg-slate-600 transition-colors"
            >
              Re-login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-900 text-foreground dark:text-slate-100 transition-colors duration-300">
      <AlertMonitoringProvider>
        <AdvancedAdminDashboard />
      </AlertMonitoringProvider>
    </div>
  );
};

export default AdminDashboard;
