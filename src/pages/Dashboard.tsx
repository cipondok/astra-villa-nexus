
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Clear any existing timeout
    if (redirectTimeout) {
      clearTimeout(redirectTimeout);
    }

    // Don't proceed if still loading or already redirected
    if (loading || hasRedirected) {
      return;
    }

    console.log('Dashboard redirect logic:', {
      loading,
      user: user?.email,
      profile: profile?.role,
      hasRedirected
    });

    // If no user, redirect to home with auth modal
    if (!user) {
      console.log('No user found, redirecting to home');
      setHasRedirected(true);
      navigate('/?auth=true', { replace: true });
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!hasRedirected) {
        console.log('Timeout reached, defaulting to user dashboard');
        setHasRedirected(true);
        navigate('/dashboard/user', { replace: true });
      }
    }, 3000); // 3 second timeout

    setRedirectTimeout(timeout);

    // If we have a user but no profile, wait a bit for profile to load
    if (user && !profile) {
      console.log('User exists but no profile, waiting...');
      const profileTimeout = setTimeout(() => {
        if (!hasRedirected) {
          console.log('Profile timeout, redirecting to user dashboard');
          setHasRedirected(true);
          navigate('/dashboard/user', { replace: true });
        }
      }, 2000);
      
      return () => clearTimeout(profileTimeout);
    }

    // If we have both user and profile, redirect based on role
    if (user && profile && !hasRedirected) {
      console.log('Redirecting based on role:', profile.role);
      setHasRedirected(true);
      
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
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [user, profile, loading, navigate, hasRedirected]);

  // Show loading with timeout indicator
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {loading ? "Loading your dashboard..." : "Redirecting to your dashboard..."}
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
        
        {/* Manual navigation options after 2 seconds */}
        <div className="mt-6 space-y-2">
          <p className="text-xs text-muted-foreground">Taking too long?</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                setHasRedirected(true);
                navigate('/dashboard/user', { replace: true });
              }}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                setHasRedirected(true);
                navigate('/', { replace: true });
              }}
              className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
