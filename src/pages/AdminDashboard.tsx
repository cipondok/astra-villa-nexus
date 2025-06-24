
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdvancedAdminDashboard from '@/components/admin/AdvancedAdminDashboard';

const AdminDashboard = () => {
  const { profile, user } = useAuth();
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Initializing admin dashboard...</p>
            <button 
              onClick={() => navigate('/?auth=true', { replace: true })}
              className="mt-4 text-blue-500 hover:text-blue-700 underline text-sm"
            >
              Having trouble? Re-login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Admin access required to view this dashboard
          </AlertDescription>
        </Alert>
        <div className="mt-4 space-x-2">
          <button 
            onClick={() => navigate('/dashboard', { replace: true })}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
          <button 
            onClick={() => navigate('/?auth=true', { replace: true })}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Re-login
          </button>
        </div>
      </div>
    );
  }

  return <AdvancedAdminDashboard />;
};

export default AdminDashboard;
