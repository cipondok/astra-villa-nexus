import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BaseProperty } from "@/types/property";

import PropertyViewModeToggle from "./PropertyViewModeToggle";
import AdvancedPropertyFilters, { PropertyFilters } from "./AdvancedPropertyFilters";
import PropertyListView from "./PropertyListView";
import PropertyGridView from "./PropertyGridView";
import PropertyMapView from "./PropertyMapView";
import PropertyDetailModal from "../property/PropertyDetailModal";
import Property3DViewModal from "../property/Property3DViewModal";

type ViewMode = 'list' | 'grid' | 'map';

interface EnhancedPropertySearchProps {
  initialFilters?: Partial<PropertyFilters>;
  showTitle?: boolean;
  embedded?: boolean;
}

const defaultFilters: PropertyFilters = {
  searchQuery: "",
  priceRange: [0, 50000000000],
  location: "",
  propertyTypes: [],
  bedrooms: null,
  bathrooms: null,
  minArea: null,
  maxArea: null,
  listingType: "all",
  sortBy: "newest"
};

const EnhancedPropertySearch = ({ 
  initialFilters = {}, 
  showTitle = true, 
  embedded = false 
}: EnhancedPropertySearchProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<PropertyFilters>({ ...defaultFilters, ...initialFilters });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");

  // Fetch properties with filtering
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['enhanced-property-search', filters],
    queryFn: async () => {
      console.log('Fetching properties with filters:', filters);
      
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .not('title', 'is', null)
        .not('title', 'eq', '')
        .gt('price', 0);

      // Apply search query
      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,location.ilike.%${filters.searchQuery}%`);
      }

      // Apply price range
      if (filters.priceRange[0] > 0) {
        query = query.gte('price', filters.priceRange[0]);
      }
      if (filters.priceRange[1] < 50000000000) {
        query = query.lte('price', filters.priceRange[1]);
      }

      // Apply location filter
      if (filters.location) {
        query = query.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%,location.ilike.%${filters.location}%`);
      }

      // Apply property types
      if (filters.propertyTypes.length > 0) {
        query = query.in('property_type', filters.propertyTypes);
      }

      // Apply listing type
      if (filters.listingType !== 'all') {
        query = query.eq('listing_type', filters.listingType);
      }

      // Apply bedroom filter
      if (filters.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms);
      }

      // Apply bathroom filter
      if (filters.bathrooms) {
        query = query.gte('bathrooms', filters.bathrooms);
      }

      // Apply area filters
      if (filters.minArea) {
        query = query.gte('area_sqm', filters.minArea);
      }
      if (filters.maxArea) {
        query = query.lte('area_sqm', filters.maxArea);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'area_large':
          query = query.order('area_sqm', { ascending: false });
          break;
        case 'popularity':
          // In a real app, you'd have a popularity score
          query = query.order('created_at', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Limit results
      query = query.limit(100);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }

      // Filter out properties with missing essential data
      const validProperties = (data || []).filter(property => 
        property.title?.trim() &&
        property.price > 0 &&
        (property.images?.length > 0 || property.image_urls?.length > 0 || property.thumbnail_url)
      ) as BaseProperty[];

      console.log('Properties loaded:', validProperties.length);
      return validProperties;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  // Quick search handler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (quickSearch !== filters.searchQuery) {
        setFilters(prev => ({ ...prev, searchQuery: quickSearch }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [quickSearch, filters.searchQuery]);

  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = { ...defaultFilters, ...initialFilters };
    setFilters(clearedFilters);
    setQuickSearch("");
  };

  const handlePropertyClick = (property: BaseProperty) => {
    setSelectedProperty(property);
    setShowDetailModal(true);
  };

  const handleView3D = (property: BaseProperty) => {
    setSelectedProperty(property);
    setShow3DModal(true);
  };

  const handleContact = (property: BaseProperty) => {
    // In a real app, this would open a contact form or start a chat
    console.log('Contact for property:', property.title);
  };

  const handleSave = (property: BaseProperty) => {
    // In a real app, this would save to user's favorites
    console.log('Save property:', property.title);
  };

  const handleShare = (property: BaseProperty) => {
    // In a real app, this would open a share dialog
    console.log('Share property:', property.title);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000000000) count++;
    if (filters.location) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.minArea || filters.maxArea) count++;
    if (filters.listingType !== 'all') count++;
    return count;
  };

  const renderPropertyView = () => {
    const commonProps = {
      properties,
      onPropertyClick: handlePropertyClick,
      onView3D: handleView3D,
      onSave: handleSave,
      onShare: handleShare,
      onContact: handleContact,
    };

    switch (viewMode) {
      case 'list':
        return <PropertyListView {...commonProps} />;
      case 'map':
        return <PropertyMapView properties={properties} onPropertyClick={handlePropertyClick} />;
      case 'grid':
      default:
        return <PropertyGridView {...commonProps} />;
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">Error loading properties. Please try again.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reload Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${embedded ? '' : 'container mx-auto px-4 py-8'}`}>
      {showTitle && (
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Find Your Perfect Property</h1>
          <p className="text-xl text-muted-foreground">
            Discover amazing properties with advanced search and filtering
          </p>
        </div>
      )}

      {/* Quick Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search properties by title, location, or description..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
              <PropertyViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <AdvancedPropertyFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        isOpen={showAdvancedFilters}
        onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

      {/* Results Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>Search Results</span>
              {isLoading ? (
                <Badge variant="outline">Loading...</Badge>
              ) : (
                <Badge variant="outline">
                  {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
                </Badge>
              )}
            </div>
            {!embedded && (
              <PropertyViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Property Results */}
      {!isLoading && renderPropertyView()}

      {/* Property Detail Modal */}
      {selectedProperty && showDetailModal && (
        <PropertyDetailModal
          property={selectedProperty}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProperty(null);
          }}
          language="en"
          onView3D={() => {
            setShowDetailModal(false);
            setShow3DModal(true);
          }}
        />
      )}

      {/* 3D View Modal */}
      {selectedProperty && show3DModal && (
        <Property3DViewModal
          property={selectedProperty}
          isOpen={show3DModal}
          onClose={() => {
            setShow3DModal(false);
            setSelectedProperty(null);
          }}
          language="en"
        />
      )}
    </div>
  );
};

export default EnhancedPropertySearch;