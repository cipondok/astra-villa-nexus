
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";
import { supabase } from "@/integrations/supabase/client";
import CompactPropertyCard from "@/components/property/CompactPropertyCard";

const Properties = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [theme, setTheme] = useState("light");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch properties from database
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching properties...");
        
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching properties:', error);
          setError(error.message);
        } else {
          console.log(`Fetched ${data?.length || 0} properties`);
          setProperties(data || []);
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

  // Filter properties based on search
  const filteredProperties = properties.filter(property => 
    !searchTerm || 
    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      noResults: "No properties found",
      loading: "Loading properties...",
      loadingError: "Error loading properties. Please try again.",
      totalFound: "properties found",
    },
    id: {
      title: "Properti",
      subtitle: "Temukan properti impian Anda",
      search: "Cari properti...",
      noResults: "Tidak ada properti ditemukan",
      loading: "Memuat properti...",
      loadingError: "Error memuat properti. Silakan coba lagi.",
      totalFound: "properti ditemukan",
    }
  };

  const currentText = text[language];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
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
      
      {/* Main Content */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center bg-white rounded-lg p-8 shadow-sm">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {currentText.title}
            </h1>
            <p className="text-xl text-gray-600">
              {currentText.subtitle}
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder={currentText.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mb-6">
              <p className="text-gray-600">
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
                <p className="text-gray-600">{currentText.loading}</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg mb-4">{currentText.loadingError}</p>
              <p className="text-gray-600">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Reload Page
              </Button>
            </div>
          )}

          {/* Properties Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((property) => (
                  <CompactPropertyCard
                    key={property.id}
                    property={property}
                    language={language}
                    onView={() => handlePropertyClick(property.id)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">
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
