import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ParticleEffect from "@/components/ParticleEffect";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import EnhancedSecureAuthModal from "@/components/auth/EnhancedSecureAuthModal";
import ModernSearchPanel from "@/components/ModernSearchPanel";
import AIChatWidget from "@/components/ai/AIChatWidget";
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
  
  // Ref to prevent duplicate searches
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
      navigate('/dashboard');
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleBrowseProperties = () => {
    navigate('/properties');
  };

  const performSearch = async (searchData: any) => {
    // Prevent duplicate searches
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

      // Always filter by approved status
      query = query.eq('status', 'approved');

      // Apply text search if provided
      if (searchData.query && searchData.query.trim()) {
        const searchTerm = searchData.query.trim().toLowerCase();
        console.log("🔍 SEARCH DEBUG - Applying text search for:", searchTerm);
        const textSearchFilter = `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`;
        query = query.or(textSearchFilter);
      }

      // Apply property type filter
      if (searchData.propertyType && searchData.propertyType.trim()) {
        console.log("🔍 SEARCH DEBUG - Applying property type filter:", searchData.propertyType);
        query = query.eq('property_type', searchData.propertyType);
      }

      // Apply bedroom filter
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

      // Apply bathroom filter
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

      // Apply location filter
      if (searchData.location && searchData.location.trim()) {
        console.log("🔍 SEARCH DEBUG - Applying location filter:", searchData.location);
        const locationTerm = searchData.location.trim().toLowerCase();
        // Assuming location is a direct match on city or state for dropdowns
        query = query.or(`city.ilike.%${locationTerm}%,state.ilike.%${locationTerm}%`);
      }

      // Apply 3D view filter
      if (searchData.has3D) {
        console.log("🔍 SEARCH DEBUG - Applying 3D view filter");
        const threeDFilter = 'three_d_model_url.not.is.null,virtual_tour_url.not.is.null';
        query = query.or(threeDFilter);
      }

      // Execute the query
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

  const handleSearch = useCallback(async (searchData: any) => {
    console.log("🚀 MANUAL SEARCH triggered:", searchData);
    setHasSearched(true);
    
    // Track search for AI recommendations
    if (user) {
      trackInteraction('search', {
        searchQuery: searchData.query,
        propertyType: searchData.propertyType,
        location: searchData.location,
        has3D: searchData.has3D,
      });
    }
    
    await performSearch(searchData);
  }, [user, trackInteraction]);

  const handleLiveSearch = useCallback(async (searchTerm: string) => {
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

    if (searchTerm.length >= 3) {
      setHasSearched(true);
      await performSearch({ query: searchTerm });
    }
  }, [hasSearched]);

  // Determine which properties to show
  const propertiesToShow = hasSearched ? searchResults : featuredProperties;
  
  console.log("🎯 DISPLAY DEBUG:", {
    hasSearched,
    featuredPropertiesCount: featuredProperties.length,
    searchResultsCount: searchResults.length,
    propertiesToShowCount: propertiesToShow.length,
    isSearching
  });

  return (
    <SessionManager>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />

        {/* Compact Hero Section */}
        <section className="relative min-h-[40vh] sm:min-h-[50vh] flex flex-col items-center justify-center overflow-hidden pt-16">
          {/* Particle Effect Background */}
          <div className="absolute inset-0 z-0">
            <ParticleEffect />
          </div>
          
          {/* Hero Content - Removed ASTRA Villa text */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed animate-fade-in">
              Discover premium real estate opportunities with AI-powered recommendations and intelligent assistance.
            </p>
          </div>

          {/* Search Panel */}
          <div className="relative z-10 w-full px-2 sm:px-4 lg:px-8 animate-fade-in animation-delay-400">
            <ModernSearchPanel 
              language={language} 
              onSearch={handleSearch}
              onLiveSearch={handleLiveSearch}
            />
          </div>
        </section>

        {/* Property Listings Section - Improved spacing */}
        <section className="relative z-10 bg-background py-4 sm:py-6 lg:py-8">
          <div className="container mx-auto px-2 sm:px-4 lg:px-6">
            {user ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="lg:col-span-2">
                  <PropertyListingsSection 
                    language={language} 
                    searchResults={propertiesToShow}
                    isSearching={isSearching}
                    hasSearched={hasSearched}
                    fallbackResults={featuredProperties}
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
            ) : (
              <PropertyListingsSection 
                language={language} 
                searchResults={propertiesToShow}
                isSearching={isSearching}
                hasSearched={hasSearched}
                fallbackResults={featuredProperties}
              />
            )}
          </div>
        </section>

        {/* Footer */}
        <div className="relative z-10">
          <ProfessionalFooter language={language} />
        </div>

        {/* Enhanced AI Chat Widget with responsive sizing */}
        <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 z-50">
          <AIChatWidget />
        </div>

        {/* Loading Popup */}
        <LoadingPopup 
          isOpen={isSearching} 
          message={language === "en" ? "Searching properties..." : "Mencari properti..."}
          language={language}
        />

        {/* Enhanced Secure Auth Modal - THIS IS THE NEW MODAL WITH ALL FEATURES */}
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
