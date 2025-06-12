import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, TrendingUp, Zap, Clock, Eye, Loader2, Search, AlertCircle } from "lucide-react";
import PropertyCard from "./PropertyCard";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PropertyListingsSectionProps {
  language: "en" | "id";
  searchResults?: any[];
  isSearching?: boolean;
  hasSearched?: boolean;
}

const PropertyListingsSection = ({ 
  language, 
  searchResults = [], 
  isSearching = false, 
  hasSearched = false 
}: PropertyListingsSectionProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const text = {
    en: {
      featured: "Featured Properties",
      popular: "Popular Searches",
      hotDeals: "Hot Deals",
      newProjects: "New Projects (Pre-launch)",
      viewAll: "View All",
      limitedTime: "Limited Time",
      comingSoon: "Coming Soon",
      trending: "Trending",
      searchResults: "Search Results",
      noResults: "No properties found matching your criteria",
      searching: "Searching properties...",
      similarProperties: "Similar Properties You Might Like",
      tryAdjusting: "Try adjusting your search criteria or browse these similar properties:",
      allProperties: "All Properties",
      noPropertiesAvailable: "No properties are currently available. Please check back later.",
      loadingError: "Error loading properties. Please try again."
    },
    id: {
      featured: "Properti Pilihan",
      popular: "Pencarian Populer",
      hotDeals: "Penawaran Terbaik", 
      newProjects: "Proyek Baru (Pra-peluncuran)",
      viewAll: "Lihat Semua",
      limitedTime: "Waktu Terbatas",
      comingSoon: "Segera Hadir",
      trending: "Trending",
      searchResults: "Hasil Pencarian",
      noResults: "Tidak ada properti yang sesuai dengan kriteria Anda",
      searching: "Mencari properti...",
      similarProperties: "Properti Serupa yang Mungkin Anda Suka",
      tryAdjusting: "Coba sesuaikan kriteria pencarian Anda atau jelajahi properti serupa ini:",
      allProperties: "Semua Properti",
      noPropertiesAvailable: "Tidak ada properti yang tersedia saat ini. Silakan periksa kembali nanti.",
      loadingError: "Error memuat properti. Silakan coba lagi."
    }
  };

  const currentText = text[language];

  // Fetch all properties from database
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching properties from database...");
        
        // First, let's check how many properties exist in total
        const { count: totalCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });
        
        console.log(`Total properties in database: ${totalCount}`);
        
        // Check how many have each status
        const { data: statusBreakdown } = await supabase
          .from('properties')
          .select('status, approval_status')
          .order('created_at', { ascending: false });
        
        console.log('Properties status breakdown:', statusBreakdown);
        
        // Now try to get approved properties
        const { data: approvedProperties, error: approvedError } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'approved')
          .eq('approval_status', 'approved')
          .order('created_at', { ascending: false });

        console.log('Approved properties query result:', { data: approvedProperties, error: approvedError });

        // If no approved properties, try to get any properties for testing
        let propertiesToUse = approvedProperties;
        
        if (!approvedProperties || approvedProperties.length === 0) {
          console.log("No approved properties found, fetching any properties for display...");
          const { data: anyProperties, error: anyError } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
          
          console.log('Any properties query result:', { data: anyProperties, error: anyError });
          propertiesToUse = anyProperties;
        }

        setDebugInfo({
          totalCount,
          statusBreakdown,
          approvedCount: approvedProperties?.length || 0,
          anyPropertiesCount: propertiesToUse?.length || 0
        });

        if (approvedError) {
          console.error('Error fetching approved properties:', approvedError);
          setError(approvedError.message);
        } else {
          console.log(`Using ${propertiesToUse?.length || 0} properties for display`);
          
          if (propertiesToUse && propertiesToUse.length > 0) {
            // Transform database properties to match the expected format
            const transformedProperties = propertiesToUse.map(property => ({
              id: property.id,
              title: property.title,
              location: `${property.area || ''}, ${property.city || ''}, ${property.state || ''}`.replace(/^,\s*|,\s*$/g, ''),
              price: property.price ? `Rp ${property.price.toLocaleString()}` : 'Contact for price',
              type: property.listing_type,
              bedrooms: property.bedrooms || 0,
              bathrooms: property.bathrooms || 0,
              area: property.area_sqm || 0,
              image: property.image_urls?.[0] || "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop",
              rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
              featured: Math.random() > 0.5, // 50% chance of being featured
              isHotDeal: Math.random() > 0.8 // 20% chance of being a hot deal
            }));
            
            setAllProperties(transformedProperties);
            setFeaturedProperties(transformedProperties.filter(p => p.featured).slice(0, 12));
          } else {
            console.log("No properties found in database at all");
            setAllProperties([]);
            setFeaturedProperties([]);
          }
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Fetch similar properties when no search results found
  useEffect(() => {
    const fetchSimilarProperties = async () => {
      if (hasSearched && searchResults.length === 0 && !isSearching && allProperties.length > 0) {
        // Use existing properties as similar properties
        setSimilarProperties(allProperties.slice(0, 6));
      }
    };

    fetchSimilarProperties();
  }, [hasSearched, searchResults.length, isSearching, allProperties]);

  const popularSearches = language === "en" 
    ? ["Apartment Jakarta", "Villa Bali", "House Surabaya", "Boarding Bandung", "Office Space", "Landed House"]
    : ["Apartemen Jakarta", "Villa Bali", "Rumah Surabaya", "Kost Bandung", "Ruang Kantor", "Rumah Tapak"];

  const hotDeals = featuredProperties.filter(p => p.isHotDeal);
  const newProjects = featuredProperties.filter(p => p.type === "new-project");

  // Transform search results to match expected format
  const transformedSearchResults = searchResults.map(property => ({
    id: property.id,
    title: property.title,
    location: `${property.area || ''}, ${property.city || ''}, ${property.state || ''}`.replace(/^,\s*|,\s*$/g, ''),
    price: property.price ? `Rp ${property.price.toLocaleString()}` : 'Contact for price',
    type: property.listing_type,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area: property.area_sqm || 0,
    image: property.image_urls?.[0] || "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop",
    rating: 4.5 + Math.random() * 0.5,
    featured: false,
    isHotDeal: false
  }));

  // Show search results if user has searched
  if (hasSearched) {
    return (
      <div className="space-y-8">
        <section className="p-4 md:p-6 lg:p-8">
          <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
            <Search className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">
              {currentText.searchResults}
            </h2>
            {isSearching && <Loader2 className="h-6 w-6 animate-spin text-blue-500" />}
          </div>

          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-muted-foreground">{currentText.searching}</p>
              </div>
            </div>
          ) : transformedSearchResults.length > 0 ? (
            <div 
              ref={gridRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
            >
              {transformedSearchResults.map((property) => (
                <div key={property.id} className="property-card h-full">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-4">
                  {currentText.noResults}
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {currentText.tryAdjusting}
                </p>
              </div>

              {/* Similar Properties Section */}
              {similarProperties.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 md:gap-3 mb-6">
                    <Star className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold">
                      {currentText.similarProperties}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                    {similarProperties.map((property) => (
                      <div key={property.id} className="property-card h-full">
                        <PropertyCard property={property} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Always show featured properties below search results */}
        {featuredProperties.length > 0 && (
          <div className="border-t pt-8">
            <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8 px-4 md:px-6 lg:px-8">
              <Star className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">
                {currentText.featured}
              </h2>
            </div>
            
            <Carousel className="w-full px-4 md:px-6 lg:px-8">
              <CarouselContent className="-ml-2 md:-ml-4">
                {featuredProperties.slice(0, 6).map((property) => (
                  <CarouselItem key={property.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="property-card h-full">
                      <PropertyCard property={property} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        )}
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <section className="p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <section className="p-4 md:p-6 lg:p-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 text-lg mb-4">{currentText.loadingError}</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            
            {/* Debug information for development */}
            {debugInfo && (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-left text-sm">
                <h4 className="font-semibold mb-2">Debug Information:</h4>
                <p>Total properties in database: {debugInfo.totalCount}</p>
                <p>Approved properties: {debugInfo.approvedCount}</p>
                <p>Any properties found: {debugInfo.anyPropertiesCount}</p>
                {debugInfo.statusBreakdown && (
                  <div className="mt-2">
                    <p className="font-medium">Status breakdown:</p>
                    <pre className="text-xs mt-1">{JSON.stringify(debugInfo.statusBreakdown, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // Show default layout when no search has been performed
  return (
    <div className="space-y-12 lg:space-y-16 xl:space-y-20">
      {/* Debug panel - remove this in production */}
      {debugInfo && allProperties.length === 0 && (
        <section className="p-4 md:p-6 lg:p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Development Debug Info</h3>
          </div>
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <p>Total properties in database: {debugInfo.totalCount}</p>
            <p>Approved properties: {debugInfo.approvedCount}</p>
            <p>Properties being displayed: {debugInfo.anyPropertiesCount}</p>
            {debugInfo.statusBreakdown && debugInfo.statusBreakdown.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">View property statuses</summary>
                <pre className="text-xs mt-1 bg-yellow-100 dark:bg-yellow-800/30 p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.statusBreakdown, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </section>
      )}

      {/* Featured Properties Carousel */}
      {featuredProperties.length > 0 && (
        <section className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Star className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 animate-pulse" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                {currentText.featured}
              </h2>
            </div>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-300 hover:scale-105"
            >
              {currentText.viewAll}
            </Button>
          </div>
          
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {featuredProperties.map((property) => (
                <CarouselItem key={property.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="property-card h-full">
                    <PropertyCard property={property} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </section>
      )}

      {/* All Properties Grid */}
      <section className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
          <Eye className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">
            {currentText.allProperties}
          </h2>
        </div>
        
        {allProperties.length > 0 ? (
          <div 
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
          >
            {allProperties.map((property) => (
              <div key={property.id} className="property-card h-full">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-4">{currentText.noPropertiesAvailable}</p>
            <p className="text-sm text-muted-foreground">
              {debugInfo?.totalCount === 0 
                ? "The database appears to be empty. Add some properties to get started."
                : "Properties exist but may need approval or have different status values."
              }
            </p>
          </div>
        )}
      </section>

      {/* Popular Searches - Only show if we have properties or if there are any properties in the database */}
      {(allProperties.length > 0 || (debugInfo?.totalCount && debugInfo.totalCount > 0)) && (
        <section className="p-4 md:p-6 lg:p-8">
          <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
            <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">
              {currentText.popular}
            </h2>
          </div>
          
          <div 
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
          >
            {popularSearches.map((search, index) => (
              <Card 
                key={index} 
                className="property-card group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md hover:shadow-2xl"
              >
                <CardContent className="p-4 md:p-6 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg lg:text-xl font-semibold group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                        {search}
                      </h3>
                      <p className="text-muted-foreground text-xs md:text-sm mt-1">
                        Popular choice
                      </p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ml-2 shrink-0 hover:scale-110 transition-transform duration-300"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">{currentText.trending}</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Hot Deals - Only show if there are hot deals */}
      {hotDeals.length > 0 && (
        <section className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mb-6 md:mb-8">
            <Zap className="h-6 w-6 md:h-8 md:w-8 text-red-500 animate-bounce" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-red-600">
              {currentText.hotDeals}
            </h2>
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse text-xs md:text-sm">
              {currentText.limitedTime}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {hotDeals.map((property) => (
              <div key={property.id} className="relative group">
                <div className="property-card transform transition-all duration-300 hover:scale-[1.02]">
                  <PropertyCard property={property} />
                </div>
                <div className="absolute top-4 right-4 bg-red-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold animate-pulse z-10">
                  🔥 HOT
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New Projects - Only show if there are new projects */}
      {newProjects.length > 0 && (
        <section className="bg-gradient-to-br from-blue-50 to-orange-50 dark:from-blue-950 dark:to-orange-950 p-4 md:p-6 lg:p-8 xl:p-12 rounded-2xl mx-4 md:mx-6 lg:mx-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mb-6 md:mb-8">
            <Clock className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">
              {currentText.newProjects}
            </h2>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs md:text-sm">
              {currentText.comingSoon}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
            {newProjects.map((property) => (
              <div key={property.id} className="relative group">
                <div className="property-card transform transition-all duration-500 hover:scale-[1.02]">
                  <PropertyCard property={property} />
                </div>
                <div className="absolute inset-0 bg-blue-600/10 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold z-10">
                  Pre-Launch
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PropertyListingsSection;
