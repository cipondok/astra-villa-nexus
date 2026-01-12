
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AlertProvider } from "@/contexts/AlertContext";
import AgentOverview from "@/components/agent/AgentOverview";
import { useHasRole } from "@/hooks/useUserRoles";

const AgentDashboard = () => {
  const { isAuthenticated, loading } = useAuth();
  const { hasRole: isAgent, isLoading: rolesLoading } = useHasRole('agent');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !rolesLoading) {
      if (!isAuthenticated) {
        navigate('/?auth=true');
      } else if (!isAgent) {
        navigate('/');
      }
    }
  }, [isAuthenticated, loading, isAgent, rolesLoading, navigate]);

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-foreground">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAgent) {
    return null;
  }

  return (
    <AlertProvider>
      <div className="min-h-screen bg-background">
        <div className="pt-4 sm:pt-6 md:pt-8 px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-4 sm:py-6 md:py-8">
            <AgentOverview />
          </div>
        </div>
      </div>
    </AlertProvider>
  );
};

export default AgentDashboard;
