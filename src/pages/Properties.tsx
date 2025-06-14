
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Bed, Bath, Car, Heart, Loader2, Box } from "lucide-react";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/utils/currency";

const Properties = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [theme, setTheme] = useState("light");
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch properties from database
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching properties for Properties page...");
        
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching properties:', error);
          setError(error.message);
        } else {
          console.log(`Fetched ${data?.length || 0} properties for Properties page`);
          setProperties(data || []);
          setFilteredProperties(data || []);
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

  // Live search effect
  useEffect(() => {
    const performLiveSearch = async () => {
      if (!searchTerm || searchTerm.trim() === '') {
        setFilteredProperties(properties);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'approved')
          .or(`title.ilike.%${searchTerm.trim()}%,description.ilike.%${searchTerm.trim()}%,location.ilike.%${searchTerm.trim()}%,city.ilike.%${searchTerm.trim()}%,state.ilike.%${searchTerm.trim()}%`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error searching properties:', error);
          setFilteredProperties([]);
        } else {
          console.log(`Live search found ${data?.length || 0} properties`);
          setFilteredProperties(data || []);
        }
      } catch (error) {
        console.error('Live search error:', error);
        setFilteredProperties([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(performLiveSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, properties]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "id" : "en");
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const text = {
    en: {
      title: "Properties",
      subtitle: "Find your perfect property",
      search: "Search properties...",
      filter: "Filter",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      parking: "Parking",
      noResults: "No properties found",
      loading: "Loading properties...",
      searching: "Searching...",
      viewDetails: "View Details",
      view3D: "3D View",
      forSale: "For Sale",
      forRent: "For Rent",
      loadingError: "Error loading properties. Please try again.",
      totalFound: "properties found"
    },
    id: {
      title: "Properti",
      subtitle: "Temukan properti impian Anda",
      search: "Cari properti...",
      filter: "Filter",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi", 
      parking: "Parkir",
      noResults: "Tidak ada properti ditemukan",
      loading: "Memuat properti...",
      searching: "Mencari...",
      viewDetails: "Lihat Detail",
      view3D: "Tampilan 3D",
      forSale: "Dijual",
      forRent: "Disewa",
      loadingError: "Error memuat properti. Silakan coba lagi.",
      totalFound: "properti ditemukan"
    }
  };

  const currentText = text[language];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header with proper Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b shadow-sm">
        {isAuthenticated ? (
          <AuthenticatedNavigation
            language={language}
            onLanguageToggle={toggleLanguage}
            theme={theme}
            onThemeToggle={toggleTheme}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-600">ASTRA Villa</h1>
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Content with proper top padding */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {currentText.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {currentText.subtitle}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder={currentText.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                </div>
              )}
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {currentText.filter}
            </Button>
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                {filteredProperties.length} {currentText.totalFound}
                {searchTerm && (
                  <span className="ml-2 text-blue-600 font-medium">
                    for "{searchTerm}"
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600 dark:text-gray-300">{currentText.loading}</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg mb-4">{currentText.loadingError}</p>
              <p className="text-gray-600 dark:text-gray-300">{error}</p>
            </div>
          )}

          {/* Properties Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                    <div className="relative">
                      <img
                        src={property.image_urls?.[0] || "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop"}
                        alt={property.title}
                        className="w-full h-48 object-cover cursor-pointer"
                        onClick={() => handlePropertyClick(property.id)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                        {property.listing_type === 'sale' ? currentText.forSale : currentText.forRent}
                      </Badge>
                      {(property.three_d_model_url || property.virtual_tour_url) && (
                        <Button
                          size="sm"
                          className="absolute bottom-2 right-2 bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePropertyClick(property.id);
                          }}
                        >
                          <Box className="h-4 w-4 mr-1" />
                          {currentText.view3D}
                        </Button>
                      )}
                    </div>
                    
                    <CardHeader className="cursor-pointer" onClick={() => handlePropertyClick(property.id)}>
                      <CardTitle className="text-lg">{property.title}</CardTitle>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {`${property.city || ''}, ${property.state || ''}`.replace(/^,\s*|,\s*$/g, '')}
                        </span>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-blue-600">
                          {property.price ? formatIDR(property.price) : 'Contact for price'}
                        </span>
                        <Badge variant="outline">{property.property_type}</Badge>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          <span>{property.bedrooms || 0} {currentText.bedrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span>{property.bathrooms || 0} {currentText.bathrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-1" />
                          <span>{property.area_sqm || 0} sqm</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => handlePropertyClick(property.id)}
                      >
                        {currentText.viewDetails}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    {searchTerm ? `No properties found for "${searchTerm}"` : currentText.noResults}
                  </p>
                  {searchTerm && (
                    <p className="text-gray-500 text-sm mt-2">
                      Try adjusting your search terms or browse all properties
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Properties;
