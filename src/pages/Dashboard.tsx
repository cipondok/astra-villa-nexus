
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, profile, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dashboard useEffect:', { loading, isAuthenticated, user: user?.email, profile: profile?.role });

    // Don't proceed if still loading
    if (loading) {
      console.log('Still loading auth state...');
      return;
    }

    // If no user, redirect to home with auth modal
    if (!isAuthenticated || !user) {
      console.log('No authenticated user, redirecting to home');
      navigate('/?auth=true', { replace: true });
      return;
    }

    // If we have a user but no profile yet, wait a bit more
    if (!profile) {
      console.log('User exists but no profile, waiting...');
      return;
    }

    // Redirect based on role
    console.log('Redirecting based on role:', profile.role);
    switch (profile.role) {
      case 'admin':
        navigate('/dashboard/admin', { replace: true });
        break;
      case 'agent':
        navigate('/dashboard/agent', { replace: true });
        break;
      case 'vendor':
        navigate('/dashboard/vendor', { replace: true });
        break;
      case 'property_owner':
        navigate('/dashboard/property-owner', { replace: true });
        break;
      case 'general_user':
      default:
        navigate('/dashboard/user', { replace: true });
        break;
    }
  }, [user, profile, loading, isAuthenticated, navigate]);

  // Show loading state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {loading ? "Loading your dashboard..." : "Redirecting..."}
          </h2>
          <p className="text-sm text-muted-foreground">
            {user ? `Welcome ${user.email}` : "Please wait..."}
          </p>
          {profile && (
            <p className="text-xs text-muted-foreground">
              Role: {profile.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
