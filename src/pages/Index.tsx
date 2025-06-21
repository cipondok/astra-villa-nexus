
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import EnhancedModernSearchPanel from "@/components/EnhancedModernSearchPanel";
import PropertyListingsSection from "@/components/PropertyListingsSection";
import ProfessionalFooter from "@/components/ProfessionalFooter";
import { useLanguage } from "@/contexts/LanguageContext";
import ResponsiveAIChatWidget from "@/components/ai/ResponsiveAIChatWidget";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { language } = useLanguage();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch featured properties for the homepage
  const { data: featuredProperties = [], isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      console.log('Fetching featured properties...');
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          description,
          price,
          property_type,
          location,
          bedrooms,
          bathrooms,
          area_sqm,
          images,
          status,
          created_at
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        console.error('Error fetching featured properties:', error);
        return [];
      }

      console.log('Featured properties fetched:', data?.length || 0);
      return data || [];
    },
  });

  const handleSearch = async (searchData: any) => {
    console.log('Search initiated:', searchData);
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, return featured properties as search results
      // In a real app, this would filter based on search criteria
      setSearchResults(featuredProperties);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLiveSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    console.log('Live search:', searchTerm);
    setIsSearching(true);
    setHasSearched(true);

    try {
      // Simulate live search delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter properties based on search term
      const filtered = featuredProperties.filter(property =>
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Live search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Use search results if available, otherwise show featured properties
  const displayProperties = hasSearched ? searchResults : featuredProperties;
  const isLoading = hasSearched ? isSearching : isFeaturedLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-fade-in">
            {language === "en" ? "Find Your Dream Property" : "Temukan Properti Impian Anda"}
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-blue-100">
            {language === "en" 
              ? "Discover the perfect home with our advanced search technology" 
              : "Temukan rumah sempurna dengan teknologi pencarian canggih kami"}
          </p>
          
          <div className="max-w-4xl mx-auto">
            <EnhancedModernSearchPanel
              language={language}
              onSearch={handleSearch}
              onLiveSearch={handleLiveSearch}
            />
          </div>
        </div>
      </section>

      {/* Property Listings Section */}
      <PropertyListingsSection
        language={language}
        searchResults={displayProperties}
        isSearching={isLoading}
        hasSearched={hasSearched}
        fallbackResults={featuredProperties}
      />

      {/* AI Chat Widget */}
      <ResponsiveAIChatWidget />

      {/* Footer */}
      <ProfessionalFooter />
    </div>
  );
};

export default Index;
