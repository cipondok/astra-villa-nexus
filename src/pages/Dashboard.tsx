
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to home');
        navigate('/?auth=true');
        return;
      }

      if (profile) {
        console.log('User logged in with role:', profile.role);
        // Redirect based on user role
        switch (profile.role) {
          case 'admin':
            console.log('Redirecting admin to admin dashboard');
            navigate('/dashboard/admin');
            break;
          case 'agent':
            console.log('Redirecting agent to agent dashboard');
            navigate('/dashboard/agent');
            break;
          case 'vendor':
            console.log('Redirecting vendor to vendor dashboard');
            navigate('/dashboard/vendor');
            break;
          case 'property_owner':
            console.log('Redirecting property owner to user dashboard');
            navigate('/dashboard/user');
            break;
          case 'general_user':
          default:
            console.log('Redirecting general user to user dashboard');
            navigate('/dashboard/user');
            break;
        }
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // This component should redirect, so we show loading while redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default Dashboard;
