
import { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PropertyAdvancedFilters from '@/components/search/PropertyAdvancedFilters';
import AdvancedPropertyFilters, { PropertyFilters } from '@/components/search/AdvancedPropertyFilters';
import PropertySearchResults from '@/components/search/PropertySearchResults';
import PropertyMapView from '@/components/search/PropertyMapView';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { BaseProperty } from '@/types/property';
import { useAlert } from '@/contexts/AlertContext';
import { Search, Filter, Grid, List, Map, SlidersHorizontal } from 'lucide-react';

const PropertySearch = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const { language, setLanguage } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [areaFilteredProperties, setAreaFilteredProperties] = useState<BaseProperty[] | null>(null);
  const [showModernFilters, setShowModernFilters] = useState(false);
  const [modernFilters, setModernFilters] = useState<PropertyFilters>({
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

  const {
    searchResults,
    isLoading,
    error,
    searchProperties,
    clearSearch,
    filters
  } = usePropertySearch();

  const handleFiltersChange = (newFilters: any) => {
    console.log('Filters changed:', newFilters);
  };

  const handleSearch = (searchData: any) => {
    console.log('Searching with:', searchData);
    searchProperties(searchData);
  };

  const handlePropertyClick = (property: BaseProperty) => {
    navigate(`/property/${property.id}`);
  };

  const handleSaveProperty = (propertyId: string) => {
    if (savedProperties.includes(propertyId)) {
      setSavedProperties(prev => prev.filter(id => id !== propertyId));
      showSuccess('Property Removed', 'Property removed from your saved list');
    } else {
      setSavedProperties(prev => [...prev, propertyId]);
      showSuccess('Property Saved', 'Property added to your saved list');
    }
  };

  const handleShareProperty = (property: BaseProperty) => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description || `Check out this property: ${property.title}`,
        url: `${window.location.origin}/property/${property.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/property/${property.id}`);
      showSuccess('Link Copied', 'Property link copied to clipboard');
    }
  };

  const handleView3D = (property: BaseProperty) => {
    if (property.three_d_model_url) {
      window.open(property.three_d_model_url, '_blank');
    }
  };

  const handleFilterByArea = (filteredProperties: BaseProperty[]) => {
    setAreaFilteredProperties(filteredProperties);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.propertyType && filters.propertyType !== 'all') count++;
    if (filters.listingType && filters.listingType !== 'all') count++;
    if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 20000000000)) count++;
    if (filters.bedrooms && filters.bedrooms !== 'all') count++;
    if (filters.bathrooms && filters.bathrooms !== 'all') count++;
    if (filters.location) count++;
    if (filters.features && filters.features.length > 0) count++;
    return count;
  };

  const text = {
    en: {
      title: "Property Search",
      subtitle: "Find your perfect property with advanced search filters",
      results: "Search Results",
      propertiesFound: "properties found",
      viewMode: "View Mode",
      clearAll: "Clear All Filters",
      noFilters: "No active filters"
    },
    id: {
      title: "Pencarian Properti",
      subtitle: "Temukan properti impian Anda dengan filter pencarian lanjutan",
      results: "Hasil Pencarian",
      propertiesFound: "properti ditemukan",
      viewMode: "Mode Tampilan",
      clearAll: "Hapus Semua Filter",
      noFilters: "Tidak ada filter aktif"
    }
  };

  const currentText = text[language];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Search className="h-8 w-8" />
                {currentText.title}
              </h1>
              <p className="text-gray-600 mt-2">{currentText.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModernFilters(true)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced Filters</span>
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
              >
                EN
              </Button>
              <Button
                variant={language === 'id' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('id')}
              >
                ID
              </Button>
            </div>
          </div>
        </div>

        {/* Modern Advanced Filters Dialog */}
        <AdvancedPropertyFilters
          filters={modernFilters}
          onFiltersChange={(newFilters) => {
            setModernFilters(newFilters);
            // Convert and apply to main search
            searchProperties({
              query: newFilters.searchQuery,
              priceRange: [newFilters.priceRange[0], newFilters.priceRange[1]],
              propertyType: newFilters.propertyTypes[0],
              listingType: newFilters.listingType,
              bedrooms: newFilters.bedrooms,
              bathrooms: newFilters.bathrooms,
              location: newFilters.location,
            });
          }}
          onClearFilters={() => {
            setModernFilters({
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
            clearSearch();
          }}
          isOpen={showModernFilters}
          onToggle={() => setShowModernFilters(!showModernFilters)}
        />

        {/* Search Filters */}
        <div className="mb-8">
          <PropertyAdvancedFilters
            language={language}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            initialFilters={filters}
          />
        </div>

        {/* Search Results Header */}
        {(searchResults && searchResults.length > 0) || isLoading ? (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {currentText.results}
                    {!isLoading && (
                      <Badge variant="secondary">
                        {searchResults?.length || 0} {currentText.propertiesFound}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {getActiveFiltersCount() > 0 ? (
                      <>
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {getActiveFiltersCount()} active filters
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSearch}
                          className="text-red-600 hover:text-red-700"
                        >
                          {currentText.clearAll}
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">{currentText.noFilters}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 mr-2">{currentText.viewMode}:</span>
                  <div className="flex border border-gray-200 rounded-md overflow-hidden">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('grid')}
                      className="rounded-none px-3"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('list')}
                      className="rounded-none px-3"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'map' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('map')}
                      className="rounded-none px-3"
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ) : null}

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200">
            <CardContent className="pt-6">
              <div className="text-red-600">
                Error loading properties: {error.message}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {viewMode === 'map' ? (
          <PropertyMapView
            properties={searchResults || []}
            onPropertyClick={handlePropertyClick}
            onFilterByArea={handleFilterByArea}
          />
        ) : (
          <PropertySearchResults
            properties={areaFilteredProperties || searchResults || []}
            language={language}
            isLoading={isLoading}
            onPropertyClick={handlePropertyClick}
            onSaveProperty={handleSaveProperty}
            onShareProperty={handleShareProperty}
            onView3D={handleView3D}
            savedPropertyIds={savedProperties}
          />
        )}
      </div>
    </div>
  );
};

export default PropertySearch;
