
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";
import PropertyOwnerOverview from "@/components/propertyowner/PropertyOwnerOverview";

const PropertyOwnerDashboard = () => {
  const { isAuthenticated, loading, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"en" | "id">("en");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/?auth=true');
    }
    if (!loading && isAuthenticated && profile?.role !== 'property_owner') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, profile, navigate]);

  const handleLanguageToggle = () => {
    setLanguage(prev => prev === "en" ? "id" : "en");
  };

  const handleThemeToggle = () => {
    if (theme === "light") {
      setTheme("middle");
    } else if (theme === "middle") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
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

  if (!isAuthenticated || profile?.role !== 'property_owner') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNavigation
        language={language}
        onLanguageToggle={handleLanguageToggle}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <PropertyOwnerOverview />
        </div>
      </div>
    </div>
  );
};

export default PropertyOwnerDashboard;
