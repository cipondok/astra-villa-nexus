
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { AlertProvider } from "@/contexts/AlertContext";
import AgentOverview from "@/components/agent/AgentOverview";

const AgentDashboard = () => {
  const { isAuthenticated, loading, profile } = useAuth();
  const navigate = useNavigate();

  console.log('AgentDashboard - Auth state:', { isAuthenticated, loading, profile });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/?auth=true');
    }
    if (!loading && isAuthenticated && profile?.role !== 'agent') {
      navigate('/');
    }
  }, [isAuthenticated, loading, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-foreground">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || profile?.role !== 'agent') {
    return null;
  }

  return (
    <AlertProvider>
      <div className="min-h-screen bg-background">
        <div className="pt-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-8">
            <AgentOverview />
          </div>
        </div>
      </div>
    </AlertProvider>
  );
};

export default AgentDashboard;
