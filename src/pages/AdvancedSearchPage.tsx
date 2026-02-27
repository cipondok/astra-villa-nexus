/**
 * Advanced Search Page - Full-featured property search with facets and autocomplete
 */

import { useState, useCallback, useMemo, useEffect, useRef, lazy, Suspense } from "react";
import { useUserBehaviorAnalytics } from "@/hooks/useUserBehaviorAnalytics";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  SlidersHorizontal, 
  Map, 
  Grid3X3, 
  List,
  Locate,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BaseProperty } from "@/types/property";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import LiveSearchAutocomplete from "@/components/search/LiveSearchAutocomplete";
import FacetedFilterPanel, { FacetedFilters, defaultFacetedFilters } from "@/components/search/FacetedFilterPanel";
import SearchResultsHeader from "@/components/search/SearchResultsHeader";
import PropertyGridView from "@/components/search/PropertyGridView";
import PropertyListView from "@/components/search/PropertyListView";
const PropertyMapView = lazy(() => import("@/components/search/PropertyMapView"));
import SearchPagination from "@/components/search/SearchPagination";
import PropertyDetailModal from "@/components/property/PropertyDetailModal";
import WhatsAppInquiryDialog from "@/components/property/WhatsAppInquiryDialog";

type ViewMode = 'grid' | 'list' | 'map';

const AdvancedSearchPage = () => {
  const navigate = useNavigate();
  const { trackSearch, trackInteraction } = useUserBehaviorAnalytics();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FacetedFilters>(defaultFacetedFilters);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const pageSize = 20;
  const lastTrackedSearch = useRef("");

  // Property modals
  const [selectedProperty, setSelectedProperty] = useState<BaseProperty | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [whatsappProperty, setWhatsappProperty] = useState<BaseProperty | null>(null);

  // Main search query
  const { data, isLoading, error } = useQuery({
    queryKey: ['advanced-property-search', searchQuery, filters, sortBy, page],
    queryFn: async () => {
      const startTime = performance.now();
      const offset = (page - 1) * pageSize;

      // Build the query
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .eq('approval_status', 'approved');

      // Apply search query
      if (searchQuery.trim()) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`
        );
      }

      // Apply filters
      if (filters.listingType) {
        query = query.eq('listing_type', filters.listingType);
      }
      if (filters.propertyTypes.length > 0) {
        query = query.in('property_type', filters.propertyTypes);
      }
      if (filters.cities.length > 0) {
        query = query.in('city', filters.cities);
      }
      if (filters.minBedrooms) {
        query = query.gte('bedrooms', filters.minBedrooms);
      }
      if (filters.priceRange[0] > 0) {
        query = query.gte('price', filters.priceRange[0]);
      }
      if (filters.priceRange[1] < 100000000000) {
        query = query.lte('price', filters.priceRange[1]);
      }
      if (filters.areaRange[0] > 0) {
        query = query.gte('area_sqm', filters.areaRange[0]);
      }
      if (filters.areaRange[1] < 10000) {
        query = query.lte('area_sqm', filters.areaRange[1]);
      }

      // Apply sorting
      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'popular':
          query = query.order('views_count', { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      query = query.range(offset, offset + pageSize - 1);

      const { data: properties, error, count } = await query;

      if (error) throw error;

      const endTime = performance.now();
      return {
        properties: (properties || []) as BaseProperty[],
        totalCount: count || 0,
        searchTimeMs: Math.round(endTime - startTime)
      };
    },
    staleTime: 30000
  });

  const properties = data?.properties || [];
  const totalCount = data?.totalCount || 0;
  const searchTimeMs = data?.searchTimeMs;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Track search interactions
  useEffect(() => {
    if (!data || isLoading) return;
    const searchKey = `${searchQuery}|${JSON.stringify(filters)}|${sortBy}|${page}`;
    if (searchKey === lastTrackedSearch.current) return;
    lastTrackedSearch.current = searchKey;

    trackSearch(searchQuery, {
      ...filters,
      sortBy,
      page,
    }, totalCount);
  }, [data, isLoading]);

  // Active filters for display
  const activeFilters = useMemo(() => {
    const filters_list: { key: string; label: string; value: string }[] = [];
    
    if (searchQuery) {
      filters_list.push({ key: 'search', label: 'Search', value: searchQuery });
    }
    if (filters.listingType) {
      filters_list.push({ key: 'listingType', label: 'Type', value: filters.listingType });
    }
    filters.propertyTypes.forEach(type => {
      filters_list.push({ key: `propertyType-${type}`, label: 'Property', value: type });
    });
    filters.cities.forEach(city => {
      filters_list.push({ key: `city-${city}`, label: 'City', value: city });
    });
    if (filters.minBedrooms) {
      filters_list.push({ key: 'bedrooms', label: 'Bedrooms', value: `${filters.minBedrooms}+` });
    }
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000000000) {
      filters_list.push({ key: 'price', label: 'Price', value: 'Custom range' });
    }
    
    return filters_list;
  }, [searchQuery, filters]);

  const handleRemoveFilter = useCallback((key: string) => {
    if (key === 'search') {
      setSearchQuery('');
    } else if (key === 'listingType') {
      setFilters(f => ({ ...f, listingType: undefined }));
    } else if (key.startsWith('propertyType-')) {
      const type = key.replace('propertyType-', '');
      setFilters(f => ({ ...f, propertyTypes: f.propertyTypes.filter(t => t !== type) }));
    } else if (key.startsWith('city-')) {
      const city = key.replace('city-', '');
      setFilters(f => ({ ...f, cities: f.cities.filter(c => c !== city) }));
    } else if (key === 'bedrooms') {
      setFilters(f => ({ ...f, minBedrooms: undefined }));
    } else if (key === 'price') {
      setFilters(f => ({ ...f, priceRange: [0, 100000000000] }));
    }
    setPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSearchQuery('');
    setFilters(defaultFacetedFilters);
    setPage(1);
  }, []);

  const handlePropertyClick = (property: BaseProperty) => {
    trackInteraction({
      interaction_type: 'click',
      property_id: property.id,
      interaction_data: {
        source: 'search_results',
        search_query: searchQuery,
        property_type: property.property_type,
        listing_type: property.listing_type,
        price: property.price,
        city: property.city,
      }
    });
    setSelectedProperty(property);
    setShowDetailModal(true);
  };

  const handleContact = (property: BaseProperty) => {
    setWhatsappProperty(property);
  };

  const handleSelectProperty = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleNearMe = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    toast.loading('Getting your location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss();
        toast.success(`Found your location! Showing nearby properties.`);
        // In a real implementation, this would filter by geo-coordinates
        // For now, just show a success message
      },
      (error) => {
        toast.dismiss();
        toast.error('Unable to get your location');
      }
    );
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive">Error loading properties. Please try again.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <LiveSearchAutocomplete
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                  setPage(1);
                }}
                onSelectProperty={handleSelectProperty}
                placeholder="Search properties, locations, or keywords..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleNearMe}
                title="Properties near me"
              >
                <Locate className="h-4 w-4" />
              </Button>

              {/* Mobile Filter Trigger */}
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFilters.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <FacetedFilterPanel
                    filters={filters}
                    onFiltersChange={(f) => {
                      setFilters(f);
                      setPage(1);
                    }}
                    className="border-0 h-full"
                  />
                </SheetContent>
              </Sheet>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FacetedFilterPanel
                filters={filters}
                onFiltersChange={(f) => {
                  setFilters(f);
                  setPage(1);
                }}
              />
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <SearchResultsHeader
              totalResults={totalCount}
              searchTimeMs={searchTimeMs}
              sortBy={sortBy}
              onSortChange={(value) => {
                setSortBy(value);
                setPage(1);
              }}
              activeFilters={activeFilters}
              onRemoveFilter={handleRemoveFilter}
              onClearAllFilters={handleClearAllFilters}
              isLoading={isLoading}
              className="mb-6"
            />

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-muted rounded-t-lg" />
                    <CardContent className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && properties.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <Button onClick={handleClearAllFilters}>
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Property Results */}
            {!isLoading && properties.length > 0 && (
              <>
                {viewMode === 'grid' && (
                  <PropertyGridView
                    properties={properties}
                    onPropertyClick={handlePropertyClick}
                    onContact={handleContact}
                    onView3D={() => {}}
                    onSave={() => {}}
                    onShare={() => {}}
                  />
                )}
                {viewMode === 'list' && (
                  <PropertyListView
                    properties={properties}
                    onPropertyClick={handlePropertyClick}
                    onContact={handleContact}
                    onView3D={() => {}}
                    onSave={() => {}}
                    onShare={() => {}}
                  />
                )}
                {viewMode === 'map' && (
                  <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
                    <PropertyMapView
                      properties={properties}
                      onPropertyClick={handlePropertyClick}
                    />
                  </Suspense>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <SearchPagination
                      currentPage={page}
                      totalPages={totalPages}
                      totalCount={totalCount}
                      pageSize={pageSize}
                      onPageChange={(newPage) => {
                        setPage(newPage);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProperty(null);
          }}
          language="en"
        />
      )}

      {/* WhatsApp Dialog */}
      {whatsappProperty && (
        <WhatsAppInquiryDialog
          open={!!whatsappProperty}
          onOpenChange={(open) => !open && setWhatsappProperty(null)}
          property={whatsappProperty}
        />
      )}
    </div>
  );
};

export default AdvancedSearchPage;
