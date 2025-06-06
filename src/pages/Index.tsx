
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import RoleBasedNavigation from "@/components/RoleBasedNavigation";
import AuthModal from "@/components/AuthModal";
import RoleBasedAuthModal from "@/components/RoleBasedAuthModal";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import SearchFilters from "@/components/SearchFilters";

const Index = () => {
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, profile, loading } = useAuth();

  console.log('Index page - Auth state:', { user: !!user, profile: !!profile, loading });

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "id" : "en");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <RoleBasedNavigation
        onLoginClick={handleLoginClick}
        language={language}
        onLanguageToggle={toggleLanguage}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Find Your Dream
            <span className="block bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              Property
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover luxury villas, modern apartments, and exclusive properties with our advanced 3D visualization and virtual staging technology.
          </p>
          
          <SearchFilters language={language} />
        </div>
      </section>

      {/* Property Listings */}
      <PropertyListingsSection language={language} />

      {/* Auth Modal */}
      <RoleBasedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
      />
    </div>
  );
};

export default Index;
