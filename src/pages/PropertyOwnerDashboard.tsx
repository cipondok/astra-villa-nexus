
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import PropertyOwnerOverview from "@/components/propertyowner/PropertyOwnerOverview";
import RoleBasedAuthModal from "@/components/RoleBasedAuthModal";

const PropertyOwnerDashboard = () => {
  const { isAuthenticated, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/?auth=true');
    }
    if (!loading && isAuthenticated && profile?.role !== 'property_owner') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, profile, navigate]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "id" : "en");
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
    <ThemeProvider defaultTheme="system" storageKey="astra-villa-theme">
      <div className="min-h-screen bg-background">
        <EnhancedNavigation
          onLoginClick={() => setShowAuthModal(true)}
          language={language}
          onLanguageToggle={toggleLanguage}
        />
        <div className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-8">
            <PropertyOwnerOverview />
          </div>
        </div>
        <RoleBasedAuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    </ThemeProvider>
  );
};

export default PropertyOwnerDashboard;
