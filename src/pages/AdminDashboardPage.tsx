
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "./AdminDashboard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoadingPage from "@/components/LoadingPage";

const AdminDashboardPage = () => {
  const { user, profile, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const navigate = useNavigate();

  // Much shorter timeout - 2 seconds max
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 2000);

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

  // Show brief loading state
  if (loading && !timeoutReached) {
    return (
      <LoadingPage
        message="Loading admin dashboard..."
        showConnectionStatus={false} // Don't show database status here
      />
    );
  }

  // Check if user is logged in
  if (!user) {
    console.log('No user found, redirecting to login');
    navigate('/?auth=true', { replace: true });
    return (
      <LoadingPage
        message="Redirecting to login..."
        showConnectionStatus={false}
      />
    );
  }

  // Check if user has admin role or is the super admin
  const isAdmin = profile?.role === 'admin' || user.email === 'mycode103@gmail.com';
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 text-foreground dark:text-gray-100 transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">Access Denied</h2>
          <p className="text-muted-foreground dark:text-gray-400 mb-4">Admin privileges required to access this dashboard</p>
          <div className="space-x-2">
            <button 
              onClick={() => navigate('/dashboard', { replace: true })}
              className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => navigate('/?auth=true', { replace: true })}
              className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
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
