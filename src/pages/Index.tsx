
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ParticleEffect from "@/components/ParticleEffect";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import RoleBasedAuthModal from "@/components/RoleBasedAuthModal";
import ModernSearchPanel from "@/components/ModernSearchPanel";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
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

  const handleSearch = async (searchData: any) => {
    console.log("Search data:", searchData);
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'approved')
        .eq('approval_status', 'approved');

      // Apply search filters
      if (searchData.searchQuery) {
        query = query.or(`title.ilike.%${searchData.searchQuery}%,description.ilike.%${searchData.searchQuery}%,location.ilike.%${searchData.searchQuery}%`);
      }

      if (searchData.propertyType) {
        query = query.eq('property_type', searchData.propertyType);
      }

      if (searchData.type && searchData.type !== 'buy') {
        query = query.eq('listing_type', searchData.type);
      }

      if (searchData.bedrooms) {
        const bedroomCount = parseInt(searchData.bedrooms.replace('+', ''));
        if (searchData.bedrooms.includes('+')) {
          query = query.gte('bedrooms', bedroomCount);
        } else {
          query = query.eq('bedrooms', bedroomCount);
        }
      }

      if (searchData.bathrooms) {
        const bathroomCount = parseInt(searchData.bathrooms.replace('+', ''));
        if (searchData.bathrooms.includes('+')) {
          query = query.gte('bathrooms', bathroomCount);
        } else {
          query = query.eq('bathrooms', bathroomCount);
        }
      }

      if (searchData.priceRange && searchData.priceRange.length === 2) {
        query = query.gte('price', searchData.priceRange[0]).lte('price', searchData.priceRange[1]);
      }

      // Location filters
      if (searchData.location) {
        if (searchData.location.state) {
          query = query.eq('state', searchData.location.state);
        }
        if (searchData.location.city) {
          query = query.eq('city', searchData.location.city);
        }
        if (searchData.location.area) {
          query = query.eq('area', searchData.location.area);
        }
      }

      const { data: properties, error } = await query.limit(50);

      if (error) {
        console.error('Error searching properties:', error);
      } else {
        setSearchResults(properties || []);
        console.log(`Found ${properties?.length || 0} properties`);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
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
          <PropertyListingsSection 
            language={language} 
            searchResults={searchResults}
            isSearching={isSearching}
            hasSearched={hasSearched}
          />
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
