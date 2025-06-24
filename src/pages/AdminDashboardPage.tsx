
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import { useEffect, useState } from "react";

const AdminDashboardPage = () => {
  const { user, profile, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Set a timeout to handle cases where auth takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, []);

  // If timeout reached and still loading, show error
  if (timeoutReached && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Timeout</h2>
          <p className="text-muted-foreground mb-4">
            The dashboard is taking longer than expected to load.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading state with faster timeout
  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
          <div className="mt-4 text-sm text-gray-500">
            Verifying admin access...
          </div>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Please log in to access the admin dashboard</p>
          <button 
            onClick={() => window.location.href = '/'}
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
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
};

export default AdminDashboardPage;
