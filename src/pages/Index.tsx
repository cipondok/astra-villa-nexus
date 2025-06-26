import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import EnhancedModernSearchPanel from "@/components/EnhancedModernSearchPanel";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import ResponsiveAIChatWidget from "@/components/ai/ResponsiveAIChatWidget";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Home, Key, Building, Rocket, Star, TrendingUp, Wrench, Sparkles, Brain, Zap } from "lucide-react";

const Index = () => {
  const { language } = useLanguage();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('ai_recommended');

  // Optimized featured properties query with aggressive caching
  const { data: featuredProperties = [], isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-properties-fast'],
    queryFn: async () => {
      console.log('Fetching featured properties with optimized query...');
      
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), 3000);
        });

        const queryPromise = supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, development_status')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(12);

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

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
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 60000,
    gcTime: 300000,
  });

  // Query for different property sections
  const { data: aiRecommendedProperties = [] } = useQuery({
    queryKey: ['ai-recommended-properties'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8);
      return data || [];
    },
    enabled: activeSection === 'ai_recommended'
  });

  const { data: popularProperties = [] } = useQuery({
    queryKey: ['popular-properties'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8);
      return data || [];
    },
    enabled: activeSection === 'popular'
  });

  const { data: rentProperties = [] } = useQuery({
    queryKey: ['rent-properties'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('listing_type', 'rent')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8);
      return data || [];
    },
    enabled: activeSection === 'rent'
  });

  const { data: saleProperties = [] } = useQuery({
    queryKey: ['sale-properties'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('listing_type', 'buy')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8);
      return data || [];
    },
    enabled: activeSection === 'sale'
  });

  const { data: newProjectProperties = [] } = useQuery({
    queryKey: ['new-project-properties'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('development_status', 'new_project')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8);
      return data || [];
    },
    enabled: activeSection === 'new_projects'
  });

  const { data: preLaunchProperties = [] } = useQuery({
    queryKey: ['pre-launch-properties'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('development_status', 'pre_launching')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8);
      return data || [];
    },
    enabled: activeSection === 'pre_launch'
  });

  const handleSearch = async (searchData: any) => {
    console.log('Search initiated with optimized query:', searchData);
    
    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Search timeout')), 5000);
      });

      let query = supabase
        .from('properties')
        .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city')
        .eq('status', 'active');

      // Apply search filters efficiently
      if (searchData.query && searchData.query.trim()) {
        const searchTerm = searchData.query.toLowerCase().trim();
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
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

      if (searchData.bedrooms) {
        const bedroomCount = searchData.bedrooms === '4+' ? 4 : parseInt(searchData.bedrooms);
        if (searchData.bedrooms === '4+') {
          query = query.gte('bedrooms', bedroomCount);
        } else {
          query = query.eq('bedrooms', bedroomCount);
        }
      }

      if (searchData.bathrooms) {
        const bathroomCount = searchData.bathrooms === '4+' ? 4 : parseInt(searchData.bathrooms);
        if (searchData.bathrooms === '4+') {
          query = query.gte('bathrooms', bathroomCount);
        } else {
          query = query.eq('bathrooms', bathroomCount);
        }
      }

      if (searchData.priceRange) {
        const [minPrice, maxPrice] = searchData.priceRange.split('-').map(Number);
        if (minPrice) {
          query = query.gte('price', minPrice);
        }
        if (maxPrice && maxPrice < 999999999999) {
          query = query.lte('price', maxPrice);
        }
      }

      const queryWithTimeout = Promise.race([
        query.order('created_at', { ascending: false }).limit(24),
        timeoutPromise
      ]);

      const { data, error } = await queryWithTimeout;

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
      setSearchError('Search timeout. Please try again.');
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

  const getCurrentSectionData = () => {
    switch (activeSection) {
      case 'ai_recommended':
        return aiRecommendedProperties;
      case 'popular':
        return popularProperties;
      case 'rent':
        return rentProperties;
      case 'sale':
        return saleProperties;
      case 'new_projects':
        return newProjectProperties;
      case 'pre_launch':
        return preLaunchProperties;
      default:
        return featuredProperties;
    }
  };

  const text = {
    en: {
      buy: "Buy",
      rent: "Rent",
      preLaunch: "Pre Launch",
      newProjects: "New Projects",
      aiRecommended: "AI Recommended",
      popular: "Most Popular",
      sale: "Sale",
      services: "Services"
    },
    id: {
      buy: "Beli",
      rent: "Sewa",
      preLaunch: "Pra Peluncuran",
      newProjects: "Proyek Baru",
      aiRecommended: "Rekomendasi AI",
      popular: "Paling Populer",
      sale: "Jual",
      services: "Layanan"
    }
  };

  const currentText = text[language] || text.en;

  return (
    <div className="min-h-screen neural-bg">
      <Navigation />
      
      {/* Modern AI Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          {/* ASTRA Villa Branding with Modern AI Touch */}
          <div className="mb-12 animate-fade-in-up">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center mr-6 shadow-2xl">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 animate-pulse opacity-75"></div>
                  <Sparkles className="text-white text-3xl font-bold relative z-10" size={32} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <Zap size={12} className="text-green-900" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 heading-modern">
                  ASTRA Villa
                </h1>
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="text-cyan-400" size={24} />
                  <p className="text-cyan-300 text-xl">
                    AI-Powered Property Intelligence
                  </p>
                </div>
                <p className="text-purple-300 text-lg">
                  Next-Generation Real Estate Platform
                </p>
              </div>
            </div>
            
            {/* AI Features Highlight */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 stagger-children">
              <div className="glass-modern px-6 py-3 flex items-center gap-2">
                <Star className="text-yellow-400" size={16} />
                <span className="text-white font-medium">AI Property Matching</span>
              </div>
              <div className="glass-modern px-6 py-3 flex items-center gap-2">
                <Brain className="text-purple-400" size={16} />
                <span className="text-white font-medium">Smart Price Prediction</span>
              </div>
              <div className="glass-modern px-6 py-3 flex items-center gap-2">
                <Zap className="text-cyan-400" size={16} />
                <span className="text-white font-medium">Instant Virtual Tours</span>
              </div>
            </div>
          </div>
          
          {/* Modern Search Panel */}
          <div className="max-w-6xl mx-auto animate-scale-in">
            <div className="search-panel-modern">
              <EnhancedModernSearchPanel
                language={language}
                onSearch={handleSearch}
                onLiveSearch={handleLiveSearch}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modern Navigation Buttons */}
      <section className="py-8 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            <Button 
              className="btn-modern"
              onClick={() => handleSearch({ listingType: 'buy' })}
            >
              <Home className="h-5 w-5 mr-2" />
              Buy Properties
            </Button>
            <Button 
              className="btn-modern"
              onClick={() => handleSearch({ listingType: 'rent' })}
            >
              <Key className="h-5 w-5 mr-2" />
              Rent Properties
            </Button>
            <Button 
              className="btn-modern"
              onClick={() => handleSearch({ development_status: 'pre_launching' })}
            >
              <Rocket className="h-5 w-5 mr-2" />
              Pre-Launch
            </Button>
            <Button 
              className="btn-modern"
              onClick={() => handleSearch({ development_status: 'new_project' })}
            >
              <Building className="h-5 w-5 mr-2" />
              New Projects
            </Button>
            <Button 
              className="btn-modern"
            >
              <Wrench className="h-5 w-5 mr-2" />
              AI Services
            </Button>
          </div>
        </div>
      </section>

      {/* Property Section Navigation */}
      <section className="py-8 bg-black/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button
              variant={activeSection === 'ai_recommended' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('ai_recommended')}
              className={`glass-modern transition-all duration-300 ${activeSection === 'ai_recommended' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                : 'text-white hover:bg-white/10'}`}
            >
              <Star className="h-4 w-4 mr-2" />
              AI Recommended
            </Button>
            <Button
              variant={activeSection === 'popular' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('popular')}
              className={`glass-modern transition-all duration-300 ${activeSection === 'popular' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                : 'text-white hover:bg-white/10'}`}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Most Popular
            </Button>
            <Button
              variant={activeSection === 'rent' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('rent')}
              className={`glass-modern transition-all duration-300 ${activeSection === 'rent' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                : 'text-white hover:bg-white/10'}`}
            >
              <Key className="h-4 w-4 mr-2" />
              Rent
            </Button>
            <Button
              variant={activeSection === 'sale' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('sale')}
              className={`glass-modern transition-all duration-300 ${activeSection === 'sale' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                : 'text-white hover:bg-white/10'}`}
            >
              <Home className="h-4 w-4 mr-2" />
              Sale
            </Button>
            <Button
              variant={activeSection === 'new_projects' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('new_projects')}
              className={`glass-modern transition-all duration-300 ${activeSection === 'new_projects' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                : 'text-white hover:bg-white/10'}`}
            >
              <Building className="h-4 w-4 mr-2" />
              New Projects
            </Button>
            <Button
              variant={activeSection === 'pre_launch' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('pre_launch')}
              className={`glass-modern transition-all duration-300 ${activeSection === 'pre_launch' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                : 'text-white hover:bg-white/10'}`}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Pre Launch
            </Button>
            <Button
              variant={activeSection === 'services' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('services')}
              className={`glass-modern transition-all duration-300 ${activeSection === 'services' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                : 'text-white hover:bg-white/10'}`}
            >
              <Wrench className="h-4 w-4 mr-2" />
              AI Services
            </Button>
          </div>
        </div>
      </section>

      {/* Error Message with Modern Styling */}
      {searchError && (
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="glass-modern bg-red-500/10 border-red-500/20 text-red-300 font-medium text-center p-6 rounded-2xl">
              {searchError}
            </div>
          </div>
        </section>
      )}

      {/* Modern Property Listings */}
      <div className="px-4 bg-black/5 backdrop-blur-sm">
        <PropertyListingsSection
          language={language}
          searchResults={hasSearched ? searchResults : getCurrentSectionData()}
          isSearching={isSearching}
          hasSearched={hasSearched}
          fallbackResults={featuredProperties}
        />
      </div>

      {/* AI Chat Widget */}
      <ResponsiveAIChatWidget />

      {/* Modern Footer */}
      <ProfessionalFooter language={language} />
    </div>
  );
};

export default Index;
