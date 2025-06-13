
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ParticleEffect from "@/components/ParticleEffect";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import RoleBasedAuthModal from "@/components/RoleBasedAuthModal";
import ModernSearchPanel from "@/components/ModernSearchPanel";
import AIChatWidget from "@/components/ai/AIChatWidget";
import SmartRecommendations from "@/components/ai/SmartRecommendations";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTracking } from "@/hooks/useUserTracking";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { trackInteraction } = useUserTracking();
  const navigate = useNavigate();

  // Check URL parameters for auth modal
  useEffect(() => {
    const authParam = searchParams.get('auth');
    
    if (authParam === 'true') {
      setAuthModalOpen(true);
    }
  }, [searchParams]);

  // Track page view for AI recommendations
  useEffect(() => {
    if (user) {
      trackInteraction('page_view', {
        page: 'home',
        timestamp: new Date().toISOString()
      });
    }
  }, [user, trackInteraction]);

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

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // If user is already logged in, redirect to dashboard
      navigate('/dashboard');
    } else {
      // If not logged in, show auth modal
      setAuthModalOpen(true);
    }
  };

  const handleBrowseProperties = () => {
    navigate('/properties');
  };

  const handleSearch = async (searchData: any) => {
    console.log("Search data:", searchData);
    setIsSearching(true);
    setHasSearched(true);
    
    // Track search for AI recommendations
    if (user) {
      trackInteraction('search', {
        searchQuery: searchData.searchQuery,
        propertyType: searchData.propertyType,
        location: searchData.location,
        priceRange: searchData.priceRange
      });
    }
    
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

      {/* Hero Section with Particle Background - Streamlined */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* Particle Effect Background */}
        <div className="absolute inset-0 z-0">
          <ParticleEffect />
        </div>
        
        {/* Hero Content - Centered and focused */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in">
            <span className="inline-block animate-gradient bg-gradient-to-r from-blue-600 via-purple-500 to-orange-500 bg-clip-text text-transparent bg-[length:300%_300%] hover:scale-105 transition-transform duration-300">
              Astra Villa
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
            Discover premium real estate opportunities with AI-powered recommendations and intelligent assistance.
          </p>
        </div>

        {/* Search Panel - Primary focus */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 animate-fade-in animation-delay-400">
          <ModernSearchPanel 
            language={language} 
            onSearch={handleSearch}
          />
        </div>
      </section>

      {/* AI-Powered Recommendations Section */}
      {user && (
        <section className="relative z-10 bg-background py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PropertyListingsSection 
                  language={language} 
                  searchResults={searchResults}
                  isSearching={isSearching}
                  hasSearched={hasSearched}
                />
              </div>
              <div className="lg:col-span-1">
                <SmartRecommendations 
                  type="properties"
                  limit={6}
                  className="sticky top-4"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Property Listings Section for non-authenticated users */}
      {!user && (
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
      )}

      {/* Enhanced Footer */}
      <div className="relative z-10">
        <ProfessionalFooter language={language} />
      </div>

      {/* AI Chat Widget */}
      <AIChatWidget />

      {/* Auth Modal */}
      <RoleBasedAuthModal 
        isOpen={authModalOpen} 
        onClose={handleAuthModalClose}
      />
    </div>
  );
};

export default Index;
