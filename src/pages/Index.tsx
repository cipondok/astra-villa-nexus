
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

  const performSearch = async (searchData: any) => {
    console.log("=== SEARCH DEBUG START ===");
    console.log("Raw search data received:", JSON.stringify(searchData, null, 2));
    
    setIsSearching(true);
    
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'approved')
        .eq('approval_status', 'approved');

      // Extract search term from various possible fields
      const searchTerm = searchData.query || searchData.searchQuery || searchData.location || '';
      console.log("Extracted search term:", searchTerm);

      if (searchTerm && searchTerm.trim() !== '') {
        const cleanSearchTerm = searchTerm.trim();
        console.log("Using clean search term:", cleanSearchTerm);
        
        // Use text search across multiple fields
        query = query.or(`title.ilike.%${cleanSearchTerm}%,description.ilike.%${cleanSearchTerm}%,location.ilike.%${cleanSearchTerm}%,area.ilike.%${cleanSearchTerm}%,city.ilike.%${cleanSearchTerm}%,state.ilike.%${cleanSearchTerm}%`);
      }

      // Handle property type filter - fix the mapping
      if (searchData.propertyType && searchData.propertyType !== 'all_types' && searchData.propertyType !== '') {
        console.log("Filtering by property type:", searchData.propertyType);
        query = query.eq('property_type', searchData.propertyType);
      }

      // Handle listing type (buy/rent/sell)
      if (searchData.type && searchData.type !== 'buy' && searchData.type !== 'all' && searchData.type !== '') {
        console.log("Filtering by listing type:", searchData.type);
        query = query.eq('listing_type', searchData.type);
      }

      // Handle bedrooms filter - fix the mapping
      if (searchData.bedrooms && searchData.bedrooms !== 'any_bedrooms' && searchData.bedrooms !== '') {
        const bedroomCount = parseInt(searchData.bedrooms.replace('+', ''));
        if (!isNaN(bedroomCount)) {
          if (searchData.bedrooms.includes('+')) {
            query = query.gte('bedrooms', bedroomCount);
          } else {
            query = query.eq('bedrooms', bedroomCount);
          }
        }
      }

      // Handle bathrooms filter - fix the mapping
      if (searchData.bathrooms && searchData.bathrooms !== 'any_bathrooms' && searchData.bathrooms !== '') {
        const bathroomCount = parseInt(searchData.bathrooms.replace('+', ''));
        if (!isNaN(bathroomCount)) {
          if (searchData.bathrooms.includes('+')) {
            query = query.gte('bathrooms', bathroomCount);
          } else {
            query = query.eq('bathrooms', bathroomCount);
          }
        }
      }

      // Handle price range filter
      if (searchData.priceRange && Array.isArray(searchData.priceRange) && searchData.priceRange.length === 2) {
        const [minPrice, maxPrice] = searchData.priceRange;
        if (minPrice > 0) {
          query = query.gte('price', minPrice);
        }
        if (maxPrice < 10000000000) {
          query = query.lte('price', maxPrice);
        }
      }

      // Handle location filter - fix the mapping
      if (searchData.location && searchData.location !== 'any_location' && typeof searchData.location === 'string') {
        console.log("Filtering by location:", searchData.location);
        query = query.or(`city.ilike.%${searchData.location}%,state.ilike.%${searchData.location}%,area.ilike.%${searchData.location}%`);
      } else if (searchData.location && typeof searchData.location === 'object' && searchData.location !== null) {
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

      console.log("Final search query results:", { data: properties, error });
      console.log("Number of results found:", properties?.length || 0);

      if (error) {
        console.error('Error searching properties:', error);
        setSearchResults([]);
      } else {
        setSearchResults(properties || []);
        console.log(`Successfully found ${properties?.length || 0} properties matching search criteria`);
      }
      
      console.log("=== SEARCH DEBUG END ===");
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (searchData: any) => {
    setHasSearched(true);
    
    // Track search for AI recommendations
    if (user) {
      trackInteraction('search', {
        searchQuery: searchData.query || searchData.searchQuery,
        propertyType: searchData.propertyType,
        location: searchData.location,
        priceRange: searchData.priceRange
      });
    }
    
    await performSearch(searchData);
  };

  // Live search function for real-time search
  const handleLiveSearch = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim() === '') {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    await performSearch({ query: searchTerm });
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
            onLiveSearch={handleLiveSearch}
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
