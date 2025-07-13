import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";
import { supabase } from "@/integrations/supabase/client";
import PropertyViewModeToggle from "@/components/search/PropertyViewModeToggle";
import PropertyListView from "@/components/search/PropertyListView";
import PropertyGridView from "@/components/search/PropertyGridView";
import PropertyMapView from "@/components/search/PropertyMapView";
import AdvancedPropertyFilters, { PropertyFilters } from "@/components/search/AdvancedPropertyFilters";
import { BaseProperty } from "@/types/property";
import PropertyComparisonPanel from "@/components/property/PropertyComparisonPanel";

type ViewMode = 'list' | 'grid' | 'map';

const Properties = () => {
  const { isAuthenticated } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<BaseProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<BaseProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<PropertyFilters>({
    searchQuery: "",
    priceRange: [0, 50000000000],
    location: "all",
    propertyTypes: [],
    bedrooms: null,
    bathrooms: null,
    minArea: null,
    maxArea: null,
    listingType: "all",
    sortBy: "newest"
  });

  // Fetch properties from database
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching properties...");
        
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, description, three_d_model_url, virtual_tour_url')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching properties:', error);
          setError(error.message);
        } else {
          console.log(`Fetched ${data?.length || 0} properties`);
          // Transform data to match BaseProperty interface
          const transformedData = data?.map(property => ({
            ...property,
            listing_type: property.listing_type as "sale" | "rent" | "lease",
            image_urls: property.images || []
          })) || [];
          setProperties(transformedData);
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

  // Apply filters to properties
  useEffect(() => {
    let filtered = [...properties];

    // Search query filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(property => 
        property.title?.toLowerCase().includes(query) ||
        property.location?.toLowerCase().includes(query) ||
        property.city?.toLowerCase().includes(query) ||
        property.description?.toLowerCase().includes(query)
      );
    }

    // Location filter
    if (filters.location && filters.location !== 'all') {
      filtered = filtered.filter(property => 
        property.location?.toLowerCase().includes(filters.location.toLowerCase()) ||
        property.city?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Property type filter
    if (filters.propertyTypes.length > 0) {
      filtered = filtered.filter(property => 
        filters.propertyTypes.includes(property.property_type || '')
      );
    }

    // Listing type filter
    if (filters.listingType !== 'all') {
      filtered = filtered.filter(property => property.listing_type === filters.listingType);
    }

    // Price range filter
    filtered = filtered.filter(property => 
      property.price >= filters.priceRange[0] && property.price <= filters.priceRange[1]
    );

    // Bedrooms filter
    if (filters.bedrooms && filters.bedrooms !== 'any') {
      const bedroomCount = parseInt(filters.bedrooms);
      filtered = filtered.filter(property => (property.bedrooms || 0) >= bedroomCount);
    }

    // Bathrooms filter
    if (filters.bathrooms && filters.bathrooms !== 'any') {
      const bathroomCount = parseInt(filters.bathrooms);
      filtered = filtered.filter(property => (property.bathrooms || 0) >= bathroomCount);
    }

    // Area filters
    if (filters.minArea) {
      filtered = filtered.filter(property => (property.area_sqm || 0) >= filters.minArea!);
    }
    if (filters.maxArea) {
      filtered = filtered.filter(property => (property.area_sqm || 0) <= filters.maxArea!);
    }

    // Sort results
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'area_large':
        filtered.sort((a, b) => (b.area_sqm || 0) - (a.area_sqm || 0));
        break;
      case 'newest':
      default:
        // Already sorted by created_at desc from query
        break;
    }

    setFilteredProperties(filtered);
  }, [properties, filters]);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "id" : "en");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handlePropertyClick = (property: BaseProperty) => {
    navigate(`/properties/${property.id}`);
  };

  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: "",
      priceRange: [0, 50000000000],
      location: "all",
      propertyTypes: [],
      bedrooms: null,
      bathrooms: null,
      minArea: null,
      maxArea: null,
      listingType: "all",
      sortBy: "newest"
    });
  };

  const text = {
    en: {
      title: "Properties",
      subtitle: "Find your perfect property with advanced search and filtering",
      loading: "Loading properties...",
      loadingError: "Error loading properties. Please try again.",
      totalFound: "properties found",
    },
    id: {
      title: "Properti",
      subtitle: "Temukan properti impian Anda dengan pencarian dan filter canggih",
      loading: "Memuat properti...",
      loadingError: "Error memuat properti. Silakan coba lagi.",
      totalFound: "properti ditemukan",
    }
  };

  const currentText = text[language];

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b shadow-sm">
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
              <h1 className="text-2xl font-bold text-primary">ASTRA Villa</h1>
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center bg-card rounded-lg p-8 shadow-sm">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {currentText.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {currentText.subtitle}
            </p>
          </div>

          {/* Advanced Filters */}
          <AdvancedPropertyFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
          />

          {/* View Controls */}
          <div className="flex items-center justify-between bg-card rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {loading ? "Loading..." : `${filteredProperties.length} ${currentText.totalFound}`}
              </span>
            </div>
            <PropertyViewModeToggle 
              viewMode={viewMode} 
              onViewModeChange={setViewMode} 
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">{currentText.loading}</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive text-lg mb-4">{currentText.loadingError}</p>
              <p className="text-muted-foreground">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Reload Page
              </Button>
            </div>
          )}

          {/* Property Views */}
          {!loading && !error && (
            <div className="bg-card rounded-lg shadow-sm">
              {viewMode === 'grid' && (
                <div className="p-6">
                  <PropertyGridView
                    properties={filteredProperties}
                    onPropertyClick={handlePropertyClick}
                    onView3D={handlePropertyClick}
                    onSave={(property) => console.log('Save property:', property.id)}
                    onShare={(property) => console.log('Share property:', property.id)}
                    onContact={(property) => console.log('Contact for property:', property.id)}
                  />
                </div>
              )}

              {viewMode === 'list' && (
                <div className="p-6">
                  <PropertyListView
                    properties={filteredProperties}
                    onPropertyClick={handlePropertyClick}
                    onView3D={handlePropertyClick}
                    onSave={(property) => console.log('Save property:', property.id)}
                    onShare={(property) => console.log('Share property:', property.id)}
                    onContact={(property) => console.log('Contact for property:', property.id)}
                  />
                </div>
              )}

              {viewMode === 'map' && (
                <div className="p-6">
                  <PropertyMapView
                    properties={filteredProperties}
                    onPropertyClick={handlePropertyClick}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Comparison Panel */}
      <PropertyComparisonPanel />
    </div>
  );
};

export default Properties;