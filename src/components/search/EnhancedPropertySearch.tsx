import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BaseProperty } from "@/types/property";
import { shareProperty } from "@/utils/shareUtils";
import { toast } from "sonner";
import { logSearchError } from "@/utils/errorLogger";

import PropertyViewModeToggle from "./PropertyViewModeToggle";
import AdvancedPropertyFilters, { PropertyFilters } from "./AdvancedPropertyFilters";
import PropertyListView from "./PropertyListView";
import PropertyGridView from "./PropertyGridView";
import PropertyMapView from "./PropertyMapView";
import PropertyDetailModal from "../property/PropertyDetailModal";
import Property3DViewModal from "../property/Property3DViewModal";
import SearchPagination from "./SearchPagination";
import WhatsAppInquiryDialog from "../property/WhatsAppInquiryDialog";

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
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [contactProperty, setContactProperty] = useState<BaseProperty | null>(null);

  // Fetch properties with filtering using optimized RPC function
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['enhanced-property-search', filters, page],
    queryFn: async () => {
      const startTime = performance.now();
      console.log('Fetching properties with filters:', filters);
      const offset = (page - 1) * pageSize;
      
      const { data, error } = await supabase.rpc('search_properties_advanced', {
        p_search_text: filters.searchQuery || null,
        p_property_type: filters.propertyTypes.length > 0 ? filters.propertyTypes[0] : null,
        p_listing_type: filters.listingType !== 'all' ? filters.listingType : null,
        p_development_status: null,
        p_state: null,
        p_city: null,
        p_location: filters.location || null,
        p_min_price: filters.priceRange[0] > 0 ? filters.priceRange[0] : null,
        p_max_price: filters.priceRange[1] < 50000000000 ? filters.priceRange[1] : null,
        p_min_bedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : null,
        p_max_bedrooms: null,
        p_min_bathrooms: filters.bathrooms ? parseInt(filters.bathrooms) : null,
        p_max_bathrooms: null,
        p_min_area: filters.minArea || null,
        p_max_area: filters.maxArea || null,
        p_furnishing: null,
        p_parking: null,
        p_floor_level: null,
        p_building_age: null,
        p_amenities: null,
        p_certifications: null,
        p_features: null,
        p_has_3d: null,
        p_has_virtual_tour: null,
        p_sort_by: filters.sortBy || 'newest',
        p_limit: pageSize,
        p_offset: offset
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 1000) {
        console.warn(`Slow search: ${duration.toFixed(0)}ms`);
      } else {
        console.log(`Search completed in ${duration.toFixed(0)}ms`);
      }

      if (error) {
        console.error('Error fetching properties:', error);
        await logSearchError(error, { filters, page, pageSize });
        throw error;
      }

      const results = data || [];
      const total = results.length > 0 ? Number(results[0].total_count) : 0;
      setTotalCount(total);

      // Filter out properties with missing essential data
      const validProperties = results.filter((property: any) => 
        property.title?.trim() &&
        property.price > 0 &&
        (property.images?.length > 0 || property.image_urls?.length > 0 || property.thumbnail_url)
      ) as BaseProperty[];

      console.log('Properties loaded:', validProperties.length, 'of', total, 'total');
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
    setPage(1); // Reset to first page when filters change
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
    setContactProperty(property);
    setWhatsappDialogOpen(true);
  };

  const handleSave = (property: BaseProperty) => {
    // In a real app, this would save to user's favorites
    console.log('Save property:', property.title);
  };

  const handleShare = async (property: BaseProperty) => {
    const success = await shareProperty({
      id: property.id,
      title: property.title,
      price: property.price || 0,
      location: property.location || property.city || '',
      images: property.images
    });
    if (success) {
      toast.success("Property link shared!");
    }
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

      {/* Pagination */}
      {!isLoading && totalCount > 0 && (
        <Card>
          <CardContent className="p-4">
            <SearchPagination
              currentPage={page}
              totalPages={Math.ceil(totalCount / pageSize)}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={isLoading}
            />
          </CardContent>
        </Card>
      )}

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

      {/* WhatsApp Inquiry Dialog */}
      {contactProperty && (
        <WhatsAppInquiryDialog
          open={whatsappDialogOpen}
          onOpenChange={setWhatsappDialogOpen}
          property={contactProperty}
        />
      )}
    </div>
  );
};

export default EnhancedPropertySearch;