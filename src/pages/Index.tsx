
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ParticleEffect from "@/components/ParticleEffect";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import RoleBasedAuthModal from "@/components/RoleBasedAuthModal";
import ModernSearchPanel from "@/components/ModernSearchPanel";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  // Check URL parameters for auth modal
  useEffect(() => {
    const authParam = searchParams.get('auth');
    
    if (authParam === 'true') {
      setAuthModalOpen(true);
    }
  }, [searchParams]);

  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    // Clear auth parameter from URL
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('auth');
      newParams.delete('message');
      newParams.delete('confirmed');
      return newParams;
    });
  };

  const handleSearch = (searchData: any) => {
    console.log("Search data:", searchData);
    // TODO: Implement search functionality
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero Section with Particle Background - More compact */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* Particle Effect Background */}
        <div className="absolute inset-0 z-0">
          <ParticleEffect />
        </div>
        
        {/* Hero Content - Reduced spacing and removed old text */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-fade-in">
            <span className="inline-block animate-gradient bg-gradient-to-r from-blue-600 via-purple-500 to-orange-500 bg-clip-text text-transparent bg-[length:300%_300%] hover:scale-105 transition-transform duration-300">
              Astra Villa
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
            Discover premium real estate opportunities in Indonesia's most sought-after locations.
          </p>
        </div>

        {/* Search Panel - Much closer to hero content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mb-4 animate-fade-in animation-delay-400">
          <ModernSearchPanel 
            language={language} 
            onSearch={handleSearch}
          />
        </div>
        
        {/* CTA Buttons - Reduced spacing */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-in animation-delay-600">
          <button 
            onClick={() => setAuthModalOpen(true)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 btn-ios btn-primary-ios"
          >
            Get Started
          </button>
          <button className="px-8 py-3 border border-border rounded-lg font-semibold hover:bg-accent transition-colors btn-ios btn-secondary-ios">
            Browse Properties
          </button>
        </div>
      </section>

      {/* Property Listings Section */}
      <div className="relative z-10 bg-background">
        <div className="container mx-auto px-4 py-8">
          <PropertyListingsSection language={language} />
        </div>
      </div>

      {/* Footer */}
      <ProfessionalFooter language={language} />

      {/* Auth Modal */}
      <RoleBasedAuthModal 
        isOpen={authModalOpen} 
        onClose={handleAuthModalClose}
      />
    </div>
  );
};

export default Index;
