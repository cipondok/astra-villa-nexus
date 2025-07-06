
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ResponsiveAIChatWidget from "@/components/ai/ResponsiveAIChatWidget";
import { supabase } from "@/integrations/supabase/client";
import SmartSearchPanel from "@/components/search/SmartSearchPanel";
import PropertySlideSection from "@/components/property/PropertySlideSection";

const Index = () => {
  const { language } = useLanguage();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Redirect authenticated users to their dashboard (only on initial load, not on navigation)
  useEffect(() => {
    if (!loading && user && profile && !window.location.search.includes('stay')) {
      // Only redirect on initial app load, not when user navigates to home
      const hasVisitedBefore = sessionStorage.getItem('hasVisitedHome');
      
      if (!hasVisitedBefore) {
        // Redirect customer service users to dashboard
        if (profile.role === 'customer_service') {
          navigate('/dashboard');
          return;
        }
        // Redirect admin users to admin panel  
        else if (profile.role === 'admin' || user.email === 'mycode103@gmail.com') {
          navigate('/admin');
          return;
        }
      }
      
      // Mark that user has visited home page
      sessionStorage.setItem('hasVisitedHome', 'true');
    }
  }, [user, profile, loading, navigate]);

  // Background wallpaper - optimized for performance
  const backgroundStyle = {
    backgroundImage: `url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  };

  // Simplified featured properties query
  const { data: featuredProperties = [], isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-properties-simple'],
    queryFn: async () => {
      console.log('Fetching featured properties...');
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, development_status')
          .eq('status', 'active')
          .not('title', 'is', null)
          .limit(6);

        if (error) {
          console.error('Properties query error:', error);
          return [];
        }

        console.log('Featured properties loaded:', data?.length || 0);
        return data || [];
        
      } catch (err) {
        console.error('Featured properties fetch error:', err);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  const handleSearch = async (searchData: any) => {
    console.log('Search initiated:', searchData);
    
    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);
    
    try {
      let query = supabase
        .from('properties')
        .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city')
        .eq('status', 'active')
        .not('title', 'is', null);

      if (searchData.query && searchData.query.trim()) {
        const searchTerm = searchData.query.toLowerCase().trim();
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`);
      }

      if (searchData.state) {
        query = query.eq('state', searchData.state);
      }

      if (searchData.city) {
        query = query.ilike('city', `%${searchData.city}%`);
      }

      if (searchData.propertyType) {
        query = query.eq('property_type', searchData.propertyType);
      }

      if (searchData.listingType) {
        query = query.eq('listing_type', searchData.listingType);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(20);

      if (error) {
        console.error('Search error:', error);
        setSearchError('Search failed. Please try again.');
        setSearchResults([]);
      } else {
        console.log('Search results:', data?.length || 0);
        setSearchResults(data || []);
        setSearchError(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search failed. Please check your connection and try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLiveSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setSearchError(null);
      return;
    }
    
    console.log('Live search:', searchTerm);
    await handleSearch({ query: searchTerm });
  };

  return (
    <div className="min-h-screen text-foreground relative">
      {/* Background Wallpaper Layer */}
      <div 
        className="fixed inset-0 z-0 opacity-30 dark:opacity-20"
        style={backgroundStyle}
      />
      
      {/* Content Layer with backdrop */}
      <div className="relative z-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm min-h-screen">
        <Navigation />
        
        {/* Hero Section */}
        <section className="relative py-4 lg:py-6 px-4">
          <div className="max-w-[1800px] mx-auto text-center">
            <div className="mb-4 lg:mb-6 animate-fade-in">
              <h1 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 leading-tight">
                <span className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-300 dark:via-purple-400 dark:to-cyan-300 bg-clip-text text-transparent animate-gradient bg-[length:300%_300%] font-extrabold tracking-tight">
                  Find Your Perfect
                </span>
                <br />
                <span className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 dark:from-purple-300 dark:via-pink-400 dark:to-orange-300 bg-clip-text text-transparent animate-gradient bg-[length:300%_300%] font-extrabold tracking-tight">
                  Property
                </span>
              </h1>
              
              <div className="relative mb-2">
                <h2 className="text-sm md:text-base font-semibold text-white dark:text-white drop-shadow-lg">
                  <span className="inline-block px-3 py-1 lg:px-4 lg:py-2 bg-gradient-to-r from-blue-500/90 to-purple-600/90 dark:from-blue-400/90 dark:to-purple-500/90 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                    AI-Powered Real Estate Platform
                  </span>
                </h2>
              </div>
              
              <p className="text-sm md:text-sm lg:text-base max-w-2xl mx-auto leading-relaxed">
                <span className="inline-block px-2 py-1 lg:px-3 lg:py-1 bg-gray-100/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 rounded-md backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-md font-medium">
                  Discover premium properties with advanced AI search technology
                </span>
              </p>
            </div>
            
            <div className="animate-scale-in">
              <SmartSearchPanel
                language={language}
                onSearch={handleSearch}
                onLiveSearch={handleLiveSearch}
              />
            </div>
          </div>
        </section>

        {/* Error Message */}
        {searchError && (
          <section className="py-2">
            <div className="max-w-[1800px] mx-auto px-6 lg:px-8">
              <div className="apple-glass border border-destructive/40 text-destructive text-center p-3 rounded-xl max-w-xl mx-auto shadow-md">
                <p className="font-medium text-sm lg:text-base">⚠️ {searchError}</p>
                <button 
                  onClick={() => {
                    setSearchError(null);
                    setSearchResults([]);
                    setHasSearched(false);
                  }}
                  className="mt-2 px-4 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                >
                  Clear Error
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Property Sections */}
        <div className="px-6 lg:px-8 space-y-12 py-8">
          <div className="max-w-[1800px] mx-auto space-y-12">
            {hasSearched ? (
              <PropertyListingsSection
                language={language}
                searchResults={searchResults}
                isSearching={isSearching}
                hasSearched={hasSearched}
                fallbackResults={[]}
              />
            ) : (
              <>
                <PropertySlideSection
                  title="Featured Properties"
                  subtitle="Handpicked premium properties for you"
                  type="featured"
                  language={language}
                  limit={8}
                />

                <PropertySlideSection
                  title="Properties for Sale"
                  subtitle="Find your dream home to purchase"
                  type="buy"
                  language={language}
                  limit={6}
                />

                <PropertySlideSection
                  title="Properties for Rent"
                  subtitle="Discover rental properties in prime locations"
                  type="rent"
                  language={language}
                  limit={6}
                />
              </>
            )}
          </div>
        </div>

        {/* AI Chat Widget */}
        <ResponsiveAIChatWidget />

        {/* Footer */}
        <ProfessionalFooter language={language} />
      </div>
    </div>
  );
};

export default Index;
