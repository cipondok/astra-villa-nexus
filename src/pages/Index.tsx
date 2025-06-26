
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
import { Home, Key, Building, Rocket, Star, TrendingUp, Wrench, Sparkles, Brain, Zap, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen mesh-gradient">
      <Navigation />
      
      {/* Ultra Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Advanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-full filter blur-3xl animate-pulse-glow"></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          {/* Ultra Modern ASTRA Villa Branding */}
          <div className="mb-12 animate-fade-in-scale stagger-ultra">
            <div className="flex items-center justify-center mb-12">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center mr-8 shadow-2xl animate-pulse-glow group-hover:scale-110 transition-transform duration-500">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary animate-shimmer opacity-75"></div>
                  <Sparkles className="text-white text-4xl font-bold relative z-10 animate-float" size={40} />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-pulse-glow">
                  <Zap size={16} className="text-green-900" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
              </div>
              <div className="text-left">
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-white mb-6 heading-ultra">
                  ASTRA Villa
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <Brain className="text-cyan-400 animate-pulse-glow" size={32} />
                  <p className="text-cyan-300 text-2xl font-semibold">
                    Next-Gen AI Property Intelligence
                  </p>
                </div>
                <p className="text-purple-300 text-xl font-medium">
                  Ultra Modern Real Estate Experience
                </p>
              </div>
            </div>
            
            {/* Advanced AI Features Showcase */}
            <div className="flex flex-wrap justify-center gap-6 mb-12 stagger-ultra">
              <div className="glass-ultra px-8 py-4 flex items-center gap-3 group">
                <Star className="text-yellow-400 animate-pulse-glow group-hover:scale-125 transition-transform" size={20} />
                <span className="text-white font-semibold text-lg">AI Property Matching</span>
              </div>
              <div className="glass-ultra px-8 py-4 flex items-center gap-3 group">
                <Brain className="text-purple-400 animate-pulse-glow group-hover:scale-125 transition-transform" size={20} />
                <span className="text-white font-semibold text-lg">Smart Price Prediction</span>
              </div>
              <div className="glass-ultra px-8 py-4 flex items-center gap-3 group">
                <Zap className="text-cyan-400 animate-pulse-glow group-hover:scale-125 transition-transform" size={20} />
                <span className="text-white font-semibold text-lg">Instant Virtual Tours</span>
              </div>
              <div className="glass-ultra px-8 py-4 flex items-center gap-3 group">
                <Sparkles className="text-pink-400 animate-pulse-glow group-hover:scale-125 transition-transform" size={20} />
                <span className="text-white font-semibold text-lg">Neural Recommendations</span>
              </div>
            </div>
          </div>
          
          {/* Ultra Modern Search Panel */}
          <div className="max-w-7xl mx-auto animate-slide-in-left">
            <div className="search-panel-ultra">
              <EnhancedModernSearchPanel
                language={language}
                onSearch={handleSearch}
                onLiveSearch={handleLiveSearch}
              />
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 animate-fade-in-scale">
            <Button className="btn-ultra text-xl px-12 py-6 group">
              Discover Properties
              <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={24} />
            </Button>
          </div>
        </div>
      </section>

      {/* Ultra Modern Navigation Buttons */}
      <section className="py-12 bg-black/10 backdrop-ultra">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 stagger-ultra">
            <Button 
              className="btn-ultra group"
              onClick={() => handleSearch({ listingType: 'buy' })}
            >
              <Home className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
              Buy Properties
            </Button>
            <Button 
              className="btn-ultra group"
              onClick={() => handleSearch({ listingType: 'rent' })}
            >
              <Key className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
              Rent Properties
            </Button>
            <Button 
              className="btn-ultra group"
              onClick={() => handleSearch({ development_status: 'pre_launching' })}
            >
              <Rocket className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
              Pre-Launch
            </Button>
            <Button 
              className="btn-ultra group"
              onClick={() => handleSearch({ development_status: 'new_project' })}
            >
              <Building className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
              New Projects
            </Button>
            <Button 
              className="btn-ultra group"
            >
              <Wrench className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
              AI Services
            </Button>
          </div>
        </div>
      </section>

      {/* Ultra Modern Property Section Navigation */}
      <section className="py-12 bg-black/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 mb-12 stagger-ultra">
            <Button
              variant={activeSection === 'ai_recommended' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('ai_recommended')}
              className={`glass-ultra transition-all duration-500 group ${activeSection === 'ai_recommended' 
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-2xl scale-105' 
                : 'text-white hover:bg-white/10 hover:scale-105'}`}
            >
              <Star className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
              AI Recommended
            </Button>
            <Button
              variant={activeSection === 'popular' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('popular')}
              className={`glass-ultra transition-all duration-500 group ${activeSection === 'popular' 
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-2xl scale-105' 
                : 'text-white hover:bg-white/10 hover:scale-105'}`}
            >
              <TrendingUp className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
              Most Popular
            </Button>
            <Button
              variant={activeSection === 'rent' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('rent')}
              className={`glass-ultra transition-all duration-500 group ${activeSection === 'rent' 
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-2xl scale-105' 
                : 'text-white hover:bg-white/10 hover:scale-105'}`}
            >
              <Key className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
              Rent
            </Button>
            <Button
              variant={activeSection === 'sale' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('sale')}
              className={`glass-ultra transition-all duration-500 group ${activeSection === 'sale' 
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-2xl scale-105' 
                : 'text-white hover:bg-white/10 hover:scale-105'}`}
            >
              <Home className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
              Sale
            </Button>
            <Button
              variant={activeSection === 'new_projects' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('new_projects')}
              className={`glass-ultra transition-all duration-500 group ${activeSection === 'new_projects' 
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-2xl scale-105' 
                : 'text-white hover:bg-white/10 hover:scale-105'}`}
            >
              <Building className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
              New Projects
            </Button>
            <Button
              variant={activeSection === 'pre_launch' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('pre_launch')}
              className={`glass-ultra transition-all duration-500 group ${activeSection === 'pre_launch' 
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-2xl scale-105' 
                : 'text-white hover:bg-white/10 hover:scale-105'}`}
            >
              <Rocket className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
              Pre Launch
            </Button>
            <Button
              variant={activeSection === 'services' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('services')}
              className={`glass-ultra transition-all duration-500 group ${activeSection === 'services' 
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-2xl scale-105' 
                : 'text-white hover:bg-white/10 hover:scale-105'}`}
            >
              <Wrench className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
              AI Services
            </Button>
          </div>
        </div>
      </section>

      {/* Error Message with Ultra Modern Styling */}
      {searchError && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="glass-ultra bg-red-500/10 border-red-500/20 text-red-300 font-medium text-center p-8 rounded-3xl animate-fade-in-scale">
              <div className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse-glow"></div>
                {searchError}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ultra Modern Property Listings */}
      <div className="px-4 bg-black/5 backdrop-ultra">
        <PropertyListingsSection
          language={language}
          searchResults={hasSearched ? searchResults : []}
          isSearching={isSearching}
          hasSearched={hasSearched}
          fallbackResults={[]}
        />
      </div>

      {/* AI Chat Widget */}
      <ResponsiveAIChatWidget />

      {/* Ultra Modern Footer */}
      <ProfessionalFooter language={language} />

      {/* Floating Action Button */}
      <div className="fab-ultra group">
        <Brain className="h-6 w-6 group-hover:scale-125 transition-transform" />
      </div>
    </div>
  );
};

export default Index;
