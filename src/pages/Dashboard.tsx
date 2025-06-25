
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import UserDashboard from '@/components/dashboard/UserDashboard';
import LoadingPage from '@/components/LoadingPage';
import { useDatabaseConnection } from '@/hooks/useDatabaseConnection';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const { connectionStatus } = useDatabaseConnection();
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);

  console.log('Dashboard - User:', user);
  console.log('Dashboard - Profile:', profile);
  console.log('Dashboard - Loading:', loading);

  useEffect(() => {
    console.log('Dashboard mounted');
    
    // Set up initialization timeout
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000); // Wait 2 seconds for auth to initialize

    return () => clearTimeout(timer);
  }, []);

  // Redirect to login if no user after initialization
  useEffect(() => {
    if (!loading && !isInitializing && !user) {
      console.log('No user found after initialization, redirecting to login');
      navigate('/?auth=true', { replace: true });
    }
  }, [user, loading, isInitializing, navigate]);

  // Show loading while auth is initializing
  if (loading || isInitializing) {
    return (
      <LoadingPage
        message="Loading your dashboard..."
        showConnectionStatus={true}
        connectionStatus={connectionStatus}
      />
    );
  }

  // Show error if no user after loading
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access your dashboard.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <button 
            onClick={() => navigate('/?auth=true', { replace: true })}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Redirect agents to admin dashboard if they're admin role
  if (profile?.role === 'admin' || user?.email === 'mycode103@gmail.com') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Admin users should use the admin dashboard.
          </AlertDescription>
        </Alert>
        <div className="mt-4 space-x-2">
          <button 
            onClick={() => navigate('/admin', { replace: true })}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Go to Admin Dashboard
          </button>
          <button 
            onClick={() => navigate('/', { replace: true })}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Show the user dashboard
  return <UserDashboard />;
};

export default Dashboard;
