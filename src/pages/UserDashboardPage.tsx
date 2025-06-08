
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import RoleDashboard from "@/components/dashboard/RoleDashboard";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";

const UserDashboardPage = () => {
  const { isAuthenticated, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [language, setLanguage] = useState<"en" | "id">((searchParams.get('lang') as "en" | "id") || "en");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to home');
        navigate('/?auth=true');
        return;
      }

      // Check if user has a valid role for this dashboard
      if (profile && !['general_user', 'property_owner'].includes(profile.role)) {
        console.log('User role not allowed for user dashboard, redirecting to appropriate dashboard');
        navigate('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, loading, profile, navigate]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "id" : "en");
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

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

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNavigation
        language={language}
        onLanguageToggle={toggleLanguage}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <RoleDashboard language={language} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
