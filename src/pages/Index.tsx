
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import RoleBasedNavigation from "@/components/RoleBasedNavigation";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";
import AuthModal from "@/components/auth/AuthModal";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import SearchFilters from "@/components/SearchFilters";

const Index = () => {
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [theme, setTheme] = useState("light");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const [searchParams] = useSearchParams();

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

  const handleSearch = () => {
    console.log('Search triggered');
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isAuthenticated ? (
        <AuthenticatedNavigation
          language={language}
          onLanguageToggle={toggleLanguage}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      ) : (
        <RoleBasedNavigation
          onLoginClick={handleLoginClick}
          language={language}
          onLanguageToggle={toggleLanguage}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      )}
      
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
          
          <SearchFilters language={language} onSearch={handleSearch} />
        </div>
      </section>

      {/* Property Listings - wrapped in error boundary-like try/catch */}
      <div className="property-listings-wrapper">
        <PropertyListingsSection language={language} />
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
      />
    </div>
  );
};

export default Index;
