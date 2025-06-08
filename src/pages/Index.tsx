
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import EnhancedAuthModal from "@/components/auth/EnhancedAuthModal";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import AdvancedFilters from "@/components/search/AdvancedFilters";
import EnhancedPropertyCard from "@/components/property/EnhancedPropertyCard";
import ParticleEffect from "@/components/ParticleEffect";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import { useTheme } from "@/components/ThemeProvider";

const Index = () => {
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const { isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleFiltersChange = (filters: any) => {
    setSearchFilters(filters);
    console.log('Filters changed:', filters);
  };

  const handleSearch = (searchData: any) => {
    console.log('Search triggered with data:', searchData);
    // Here you would typically make an API call to search properties
    // For now, we'll just log the search data
  };

  const handlePropertyView = (id: string) => {
    navigate(`/property/${id}`);
  };

  const handlePropertySave = (id: string) => {
    console.log('Property saved:', id);
    // Implement save functionality
  };

  const handlePropertyShare = (id: string) => {
    console.log('Property shared:', id);
    // Implement share functionality
  };

  // Sample properties for demonstration
  const sampleProperties = [
    {
      id: '1',
      title: 'Luxury Villa with Ocean View',
      price: 8500000000,
      location: 'Canggu, Bali',
      bedrooms: 4,
      bathrooms: 3,
      area_sqm: 350,
      property_type: 'villa',
      listing_type: 'sale',
      images: ['/placeholder.svg'],
      property_features: {
        pool: true,
        parking: 2,
        garden: true,
        furnished: true
      }
    },
    {
      id: '2',
      title: 'Modern Apartment in City Center',
      price: 45000000,
      location: 'Jakarta Selatan, Jakarta',
      bedrooms: 2,
      bathrooms: 2,
      area_sqm: 120,
      property_type: 'apartment',
      listing_type: 'rent',
      images: ['/placeholder.svg'],
      property_features: {
        parking: 1,
        furnished: true,
        gym: true,
        security: true
      }
    },
    {
      id: '3',
      title: 'Traditional House with Garden',
      price: 3200000000,
      location: 'Yogyakarta, DIY',
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 200,
      property_type: 'house',
      listing_type: 'sale',
      images: ['/placeholder.svg'],
      property_features: {
        garden: true,
        parking: 1,
        traditional: true
      }
    }
  ];

  // Show loading only for a brief moment
  if (loading) {
    console.log('Showing loading screen');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
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
      />
      
      {/* Hero Section with Advanced Search */}
      <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 relative">
        {/* 3D Particle Effect as Background */}
        <div className="absolute inset-0 z-0">
          <ParticleEffect />
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground/60 mb-6">
            Find Your Dream
            <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent opacity-60">
              Property
            </span>
          </h1>
          <p className="text-xl text-muted-foreground opacity-60 mb-8 max-w-3xl mx-auto">
            Discover luxury villas, modern apartments, and exclusive properties with our advanced search technology.
          </p>
          
          {/* Advanced Filters Component */}
          <div className="mb-8">
            <AdvancedFilters 
              language={language} 
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {language === 'en' ? 'Featured Properties' : 'Properti Unggulan'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Discover our handpicked selection of premium properties'
                : 'Temukan pilihan properti premium yang telah kami kurasi'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleProperties.map((property) => (
              <EnhancedPropertyCard
                key={property.id}
                property={property}
                language={language}
                onView={handlePropertyView}
                onSave={handlePropertySave}
                onShare={handlePropertyShare}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Original Property Listings */}
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
