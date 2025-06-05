
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import RoleBasedNavigation from "@/components/RoleBasedNavigation";
import RoleBasedAuthModal from "@/components/RoleBasedAuthModal";
import SearchFilters from "@/components/SearchFilters";
import PropertyListingsSection from "@/components/PropertyListingsSection";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "id">("en");
  const { theme, setTheme } = useTheme();

  const text = {
    en: {
      title: "Find Your Perfect Property",
      subtitle: "Indonesia's Complete Property & Lifestyle Ecosystem"
    },
    id: {
      title: "Temukan Properti Impian Anda", 
      subtitle: "Ekosistem Properti & Gaya Hidup Lengkap Indonesia"
    }
  };

  const currentText = text[language];

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "id" : "en");
  };

  const handleSearch = (filters: any) => {
    console.log("Search filters:", filters);
    // TODO: Implement search functionality
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation 
        onLoginClick={() => setIsAuthModalOpen(true)}
        language={language}
        onLanguageToggle={toggleLanguage}
        theme={theme}
        onThemeToggle={() => setTheme(theme === "light" ? "dark" : "light")}
      />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-orange-500">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            {currentText.title}
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90 animate-fade-in">
            {currentText.subtitle}
          </p>
          
          {/* Search Section */}
          <div className="max-w-6xl mx-auto animate-scale-in">
            <SearchFilters language={language} onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Property Listings Sections */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <PropertyListingsSection language={language} />
        </div>
      </section>

      <RoleBasedAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
      />
    </div>
  );
};

export default Index;
