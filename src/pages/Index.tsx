
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
      navigate('/dashboard');
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleBrowseProperties = () => {
    navigate('/properties');
  };

  const performSearch = async (searchData: any) => {
    console.log("🔍 SEARCH DEBUG - Starting search with:", searchData);
    
    setIsSearching(true);
    
    try {
      // Simple query for approved properties only (no more duplicate approval_status)
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'approved');

      console.log("🔍 SEARCH DEBUG - Base query for approved properties");

      // Apply text search if provided
      if (searchData.query && searchData.query.trim()) {
        const searchTerm = searchData.query.trim().toLowerCase();
        console.log("🔍 SEARCH DEBUG - Applying text search for:", searchTerm);
        
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
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
        query = query.or(`city.ilike.%${locationTerm}%,state.ilike.%${locationTerm}%,location.ilike.%${locationTerm}%`);
      }

      // Execute the query
      console.log("🔍 SEARCH DEBUG - Executing query...");
      const { data: properties, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('🔍 SEARCH ERROR:', error);
        setSearchResults([]);
      } else {
        console.log(`🔍 SEARCH SUCCESS - Found ${properties?.length || 0} properties`);
        console.log("🔍 SEARCH DEBUG - Sample results:", properties?.slice(0, 2));
        setSearchResults(properties || []);
      }
      
    } catch (error) {
      console.error('🔍 SEARCH EXCEPTION:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (searchData: any) => {
    console.log("🚀 MANUAL SEARCH triggered:", searchData);
    setHasSearched(true);
    
    // Track search for AI recommendations
    if (user) {
      trackInteraction('search', {
        searchQuery: searchData.query,
        propertyType: searchData.propertyType,
        location: searchData.location
      });
    }
    
    await performSearch(searchData);
  };

  const handleLiveSearch = async (searchTerm: string) => {
    console.log("⚡ LIVE SEARCH triggered:", searchTerm);
    
    if (!searchTerm || searchTerm.trim() === '') {
      if (hasSearched) {
        setSearchResults([]);
        setHasSearched(false);
      }
      return;
    }

    if (searchTerm.length >= 3) {
      setHasSearched(true);
      await performSearch({ query: searchTerm });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero Section with Particle Background */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* Particle Effect Background */}
        <div className="absolute inset-0 z-0">
          <ParticleEffect />
        </div>
        
        {/* Hero Content */}
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

        {/* Search Panel */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 animate-fade-in animation-delay-400">
          <ModernSearchPanel 
            language={language} 
            onSearch={handleSearch}
            onLiveSearch={handleLiveSearch}
          />
        </div>
      </section>

      {/* Results and Recommendations Section */}
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

      {/* Footer */}
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
