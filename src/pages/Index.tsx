
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import EnhancedAuthModal from "@/components/auth/EnhancedAuthModal";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ModernSearchPanel from "@/components/ModernSearchPanel";
import ParticleEffect from "@/components/ParticleEffect";
import ProfessionalFooter from "@/components/ProfessionalFooter";

const Index = () => {
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [theme, setTheme] = useState("light");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const [searchParams] = useSearchParams();

  console.log('Index component rendering, loading:', loading, 'isAuthenticated:', isAuthenticated);

  // Check if auth modal should be opened from URL
  useEffect(() => {
    if (searchParams.get('auth') === 'true') {
      setIsAuthModalOpen(true);
    }
  }, [searchParams]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "id" : "en");
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleSearch = (searchData: any) => {
    console.log('Search triggered with data:', searchData);
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Show loading only for a brief moment
  if (loading) {
    console.log('Showing loading screen');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ios-blue mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering main content');

  return (
    <div className="min-h-screen bg-background">
      <EnhancedNavigation
        onLoginClick={!isAuthenticated ? handleLoginClick : undefined}
        language={language}
        onLanguageToggle={toggleLanguage}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      
      {/* Hero Section with Modern Search */}
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 relative">
        {/* 3D Particle Effect as Background */}
        <div className="absolute inset-0 z-0">
          <ParticleEffect />
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground/60 mb-6">
            Find Your Dream
            <span className="block bg-gradient-to-r from-ios-blue to-ios-blue/80 bg-clip-text text-transparent opacity-60">
              Property
            </span>
          </h1>
          <p className="text-xl text-muted-foreground opacity-60 mb-8 max-w-3xl mx-auto">
            Discover luxury villas, modern apartments, and exclusive properties with our advanced search technology.
          </p>
          
          <ModernSearchPanel language={language} onSearch={handleSearch} />
        </div>
      </section>

      {/* Property Listings */}
      <div className="property-listings-wrapper">
        <PropertyListingsSection language={language} />
      </div>

      {/* Professional Footer */}
      <ProfessionalFooter language={language} />

      {/* Enhanced Auth Modal */}
      <EnhancedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
      />
    </div>
  );
};

export default Index;
