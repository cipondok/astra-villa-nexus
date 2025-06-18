
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ParticleEffect from "@/components/ParticleEffect";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import EnhancedSecureAuthModal from "@/components/auth/EnhancedSecureAuthModal";
import EnhancedModernSearchPanel from "@/components/EnhancedModernSearchPanel";
import ResponsiveAIChatWidget from "@/components/ai/ResponsiveAIChatWidget";
import SmartRecommendations from "@/components/ai/SmartRecommendations";
import LoadingPopup from "@/components/LoadingPopup";
import { SessionManager } from "@/components/auth/SessionManager";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTracking } from "@/hooks/useUserTracking";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { trackInteraction } = useUserTracking();
  const navigate = useNavigate();
  
  const lastSearchQueryRef = useRef("");
  const searchInProgressRef = useRef(false);

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

  // Fetch featured properties on initial mount ONLY
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        console.log("🏠 FETCHING featured properties...");
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(12);

        if (!error && data) {
          console.log(`🏠 FEATURED properties loaded: ${data.length} items`);
          setFeaturedProperties(data);
        } else {
          console.error('🏠 FEATURED properties error:', error);
          setFeaturedProperties([]);
        }
      } catch (err) {
        console.error('🏠 FEATURED properties exception:', err);
        setFeaturedProperties([]);
      }
    };
    fetchFeaturedProperties();
  }, []);

  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
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
      navigate('/dashboard');
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleBrowseProperties = () => {
    navigate('/properties');
  };

  // Simplified performSearch function without complex dependencies
  const performSearch = async (searchData: any) => {
    if (searchInProgressRef.current) {
      console.log("🔍 SEARCH BLOCKED - Search already in progress");
      return;
    }

    const searchKey = JSON.stringify(searchData);
    if (lastSearchQueryRef.current === searchKey) {
      console.log("🔍 SEARCH BLOCKED - Duplicate search prevented");
      return;
    }

    console.log("🔍 SEARCH DEBUG - Starting search with:", searchData);
    
    searchInProgressRef.current = true;
    lastSearchQueryRef.current = searchKey;
    setIsSearching(true);
    
    try {
      let query = supabase
        .from('properties')
        .select('*');

      query = query.eq('status', 'approved');

      // Handle text search
      if (searchData.query && searchData.query.trim()) {
        const searchTerm = searchData.query.trim().toLowerCase();
        console.log("🔍 SEARCH DEBUG - Applying text search for:", searchTerm);
        const textSearchFilter = `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`;
        query = query.or(textSearchFilter);
      }

      // Handle property type filter
      if (searchData.propertyType && searchData.propertyType.trim()) {
        console.log("🔍 SEARCH DEBUG - Applying property type filter:", searchData.propertyType);
        query = query.eq('property_type', searchData.propertyType);
      }

      // Handle state filter
      if (searchData.state && searchData.state.trim()) {
        console.log("🔍 SEARCH DEBUG - Applying state filter:", searchData.state);
        query = query.ilike('state', `%${searchData.state}%`);
      }

      // Handle city filter
      if (searchData.city && searchData.city.trim()) {
        console.log("🔍 SEARCH DEBUG - Applying city filter:", searchData.city);
        query = query.ilike('city', `%${searchData.city}%`);
      }

      // Handle bedrooms filter
      if (searchData.bedrooms && searchData.bedrooms.trim()) {
        console.log("🔍 SEARCH DEBUG - Applying bedroom filter:", searchData.bedrooms);
        const bedroomValue = searchData.bedrooms.replace('+', '');
        const bedroomCount = parseInt(bedroomValue);
        
        if (!isNaN(bedroomCount)) {
          if (searchData.bedrooms.includes('+')) {
            query = query.gte('bedrooms', bedroomCount);
          } else {
            query = query.eq('bedrooms', bedroomCount);
          }
        }
      }

      // Handle bathrooms filter
      if (searchData.bathrooms && searchData.bathrooms.trim()) {
        console.log("🔍 SEARCH DEBUG - Applying bathroom filter:", searchData.bathrooms);
        const bathroomValue = searchData.bathrooms.replace('+', '');
        const bathroomCount = parseInt(bathroomValue);
        
        if (!isNaN(bathroomCount)) {
          if (searchData.bathrooms.includes('+')) {
            query = query.gte('bathrooms', bathroomCount);
          } else {
            query = query.eq('bathrooms', bathroomCount);
          }
        }
      }

      // Handle furnishing filter
      if (searchData.furnishing && searchData.furnishing.trim()) {
        console.log("🔍 SEARCH DEBUG - Applying furnishing filter:", searchData.furnishing);
        query = query.eq('furnishing', searchData.furnishing);
      }

      // Handle price range filter
      if (searchData.priceRange && searchData.priceRange.trim()) {
        console.log("🔍 SEARCH DEBUG - Applying price range filter:", searchData.priceRange);
        const priceRange = searchData.priceRange;
        
        if (priceRange === '0-1b') {
          query = query.lt('price', 1000000000);
        } else if (priceRange === '1b-5b') {
          query = query.gte('price', 1000000000).lt('price', 5000000000);
        } else if (priceRange === '5b+') {
          query = query.gte('price', 5000000000);
        }
      }

      // Handle location filter (fallback for general location)
      if (searchData.location && searchData.location.trim()) {
        console.log("🔍 SEARCH DEBUG - Applying location filter:", searchData.location);
        const locationTerm = searchData.location.trim().toLowerCase();
        query = query.or(`city.ilike.%${locationTerm}%,state.ilike.%${locationTerm}%`);
      }

      // Handle 3D view filter
      if (searchData.has3D) {
        console.log("🔍 SEARCH DEBUG - Applying 3D view filter");
        const threeDFilter = 'three_d_model_url.not.is.null,virtual_tour_url.not.is.null';
        query = query.or(threeDFilter);
      }

      const { data: properties, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('🔍 SEARCH ERROR:', error);
        setSearchResults([]);
      } else {
        console.log(`🔍 SEARCH SUCCESS - Found ${properties?.length || 0} properties`);
        setSearchResults(properties || []);
      }
      
    } catch (error) {
      console.error('🔍 SEARCH EXCEPTION:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      searchInProgressRef.current = false;
    }
  };

  // Simplified handleSearch without complex useCallback dependencies
  const handleSearch = (searchData: any) => {
    console.log("🚀 MANUAL SEARCH triggered:", searchData);
    setHasSearched(true);
    
    if (user) {
      trackInteraction('search', {
        searchQuery: searchData.query,
        propertyType: searchData.propertyType,
        location: searchData.location,
        state: searchData.state,
        city: searchData.city,
        bedrooms: searchData.bedrooms,
        bathrooms: searchData.bathrooms,
        furnishing: searchData.furnishing,
        priceRange: searchData.priceRange,
        has3D: searchData.has3D,
        amenities: searchData.amenities,
      });
    }
    
    performSearch(searchData);
  };

  // Simplified handleLiveSearch without complex useCallback dependencies
  const handleLiveSearch = (searchTerm: string) => {
    console.log("⚡ LIVE SEARCH triggered:", searchTerm);
    
    if (!searchTerm || searchTerm.trim() === '') {
      if (hasSearched) {
        console.log("⚡ LIVE SEARCH - Clearing search, resetting to featured");
        setSearchResults([]);
        setHasSearched(false);
        lastSearchQueryRef.current = "";
      }
      return;
    }

    if (searchTerm.length >= 2) {
      setHasSearched(true);
      performSearch({ query: searchTerm });
    }
  };

  const propertiesToShow = hasSearched ? searchResults : featuredProperties;

  return (
    <SessionManager>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />

        <section className="relative min-h-[35vh] sm:min-h-[40vh] flex flex-col items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 z-0">
            <ParticleEffect />
          </div>
          
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed animate-fade-in">
              Discover premium real estate opportunities with AI-powered recommendations and intelligent assistance.
            </p>
          </div>

          <div className="relative z-10 w-full px-2 sm:px-4 lg:px-8 animate-fade-in animation-delay-400">
            <EnhancedModernSearchPanel 
              language={language} 
              onSearch={handleSearch}
              onLiveSearch={handleLiveSearch}
            />
          </div>
        </section>

        <section className="relative z-10 bg-background py-2 sm:py-4 lg:py-6">
          <div className="container mx-auto px-2 sm:px-4 lg:px-6">
            {user ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="lg:col-span-3">
                  <PropertyListingsSection 
                    language={language} 
                    searchResults={propertiesToShow}
                    isSearching={isSearching}
                    hasSearched={hasSearched}
                    fallbackResults={featuredProperties}
                    showSearchFilters={true}
                    onSearch={handleSearch}
                    onLiveSearch={handleLiveSearch}
                  />
                </div>
                <div className="lg:col-span-1">
                  <SmartRecommendations 
                    type="properties"
                    limit={4}
                    className="sticky top-4"
                  />
                </div>
              </div>
            ) : (
              <PropertyListingsSection 
                language={language} 
                searchResults={propertiesToShow}
                isSearching={isSearching}
                hasSearched={hasSearched}
                fallbackResults={featuredProperties}
                showSearchFilters={true}
                onSearch={handleSearch}
                onLiveSearch={handleLiveSearch}
              />
            )}
          </div>
        </section>

        <div className="relative z-10">
          <ProfessionalFooter language={language} />
        </div>

        <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 z-50">
          <ResponsiveAIChatWidget />
        </div>

        <LoadingPopup 
          isOpen={isSearching} 
          message={language === "en" ? "Searching properties..." : "Mencari properti..."}
          language={language}
        />

        <EnhancedSecureAuthModal 
          isOpen={authModalOpen} 
          onClose={handleAuthModalClose}
          language={language}
        />
      </div>
    </SessionManager>
  );
};

export default Index;
