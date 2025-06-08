
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to home');
        navigate('/?auth=true');
        return;
      }

      // Check if user's email is verified
      if (!user.email_confirmed_at) {
        console.log('User email not confirmed yet');
        navigate('/?auth=true&message=Please check your email and click the verification link to activate your account.');
        return;
      }

      if (profile) {
        console.log('User logged in with role:', profile.role);
        // Redirect based on user role
        switch (profile.role) {
          case 'admin':
            console.log('Redirecting admin to admin dashboard');
            navigate('/dashboard/admin', { replace: true });
            break;
          case 'agent':
            console.log('Redirecting agent to agent dashboard');
            navigate('/dashboard/agent', { replace: true });
            break;
          case 'vendor':
            console.log('Redirecting vendor to vendor dashboard');
            navigate('/dashboard/vendor', { replace: true });
            break;
          case 'property_owner':
            console.log('Redirecting property owner to user dashboard');
            navigate('/dashboard/user', { replace: true });
            break;
          case 'general_user':
          default:
            console.log('Redirecting general user to user dashboard');
            navigate('/dashboard/user', { replace: true });
            break;
        }
      } else if (user && user.email_confirmed_at) {
        // If user exists and email is confirmed but no profile, redirect to user dashboard with fallback
        console.log('User exists and email confirmed but no profile, redirecting to user dashboard');
        navigate('/dashboard/user', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show email verification message if email is not confirmed
  if (user && !user.email_confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Please Verify Your Email</h2>
          <p className="text-muted-foreground mb-6">
            We've sent a verification link to <strong>{user.email}</strong>. 
            Please check your email and click the link to activate your account.
          </p>
          <button 
            onClick={() => navigate('/?auth=true')}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // This component should redirect, so we show loading while redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;
