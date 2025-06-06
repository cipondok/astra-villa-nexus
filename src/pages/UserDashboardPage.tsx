
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import UserDashboard from "@/components/dashboard/UserDashboard";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";

const UserDashboardPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const language = (searchParams.get('lang') as "en" | "id") || "en";

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/?auth=true');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AuthenticatedNavigation
        language={language}
        onLanguageToggle={() => {}}
        theme="light"
        onThemeToggle={() => {}}
      />
      <div className="pt-16">
        <UserDashboard language={language} />
      </div>
    </div>
  );
};

export default UserDashboardPage;
