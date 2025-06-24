
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminDashboardPage = () => {
  const { user, profile, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const navigate = useNavigate();

  // Simplified timeout - 5 seconds max
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // If timeout reached and still loading, redirect to login
  useEffect(() => {
    if (timeoutReached && loading) {
      console.log('Loading timeout reached, redirecting to login');
      toast.error('Authentication timeout. Please log in again.');
      navigate('/?auth=true', { replace: true });
    }
  }, [timeoutReached, loading, navigate]);

  // Show loading state
  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    console.log('No user found, redirecting to login');
    navigate('/?auth=true', { replace: true });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Please log in to access the admin dashboard</p>
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

  // Check if user has admin role or is the super admin
  const isAdmin = profile?.role === 'admin' || user.email === 'mycode103@gmail.com';
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Admin privileges required to access this dashboard</p>
          <div className="space-x-2">
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
      </div>
    );
  }

  return <AdminDashboard />;
};

export default AdminDashboardPage;
