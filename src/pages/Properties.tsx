
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Bed, Bath, Car, Heart, Loader2 } from "lucide-react";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/utils/currency";

const Properties = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [theme, setTheme] = useState("light");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch properties from database
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'approved')
          .eq('approval_status', 'approved')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching properties:', error);
        } else {
          setProperties(data || []);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "id" : "en");
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
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
      viewDetails: "View Details",
      forSale: "For Sale",
      forRent: "For Rent"
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
      viewDetails: "Lihat Detail",
      forSale: "Dijual",
      forRent: "Disewa"
    }
  };

  const currentText = text[language];

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.description && property.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isAuthenticated && (
        <AuthenticatedNavigation
          language={language}
          onLanguageToggle={toggleLanguage}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      )}
      
      <div className={`${isAuthenticated ? 'pt-16' : 'pt-8'} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
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
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {currentText.filter}
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600 dark:text-gray-300">{currentText.loading}</p>
              </div>
            </div>
          )}

          {/* Properties Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={property.image_urls?.[0] || "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop"}
                        alt={property.title}
                        className="w-full h-48 object-cover"
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
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-lg">{property.title}</CardTitle>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.location}</span>
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
                      
                      <Button className="w-full">
                        {currentText.viewDetails}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    {currentText.noResults}
                  </p>
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
