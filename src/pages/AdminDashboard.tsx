
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
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <Alert className="bg-card border-border">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-foreground">
              Admin access required to view this dashboard
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-x-2">
            <button 
              onClick={() => navigate('/dashboard', { replace: true })}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => navigate('/?auth=true', { replace: true })}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/90 transition-colors"
            >
              Re-login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AlertMonitoringProvider>
        <AdvancedAdminDashboard />
      </AlertMonitoringProvider>
    </div>
  );
};

export default AdminDashboard;
